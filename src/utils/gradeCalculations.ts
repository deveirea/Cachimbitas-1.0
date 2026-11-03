import { CourseCalculationResult, CourseConfig, MissingEvaluation } from '../types';

export const PASSING_GRADE = 11.0;
export const MERIT_GRADE = 14.0;
export const EXCELLENCE_GRADE = 16.0;

export function clampGrade(val: number | null | undefined): number | null {
  if (val === null || val === undefined || isNaN(val)) return null;
  return Math.min(20, Math.max(0, Math.round(val * 10) / 10));
}

export function formatGrade(val: number | null | undefined, placeholder = '—'): string {
  if (val === null || val === undefined || isNaN(val)) return placeholder;
  return Number.isInteger(val) ? val.toString() : val.toFixed(1);
}

export function getGradeColorClass(val: number | null | undefined): {
  bg: string;
  text: string;
  border: string;
  badge: string;
  status: 'passed' | 'warning' | 'failed' | 'empty';
} {
  if (val === null || val === undefined || isNaN(val)) {
    return {
      bg: 'bg-stone-50 dark:bg-stone-900',
      text: 'text-stone-700 dark:text-stone-300',
      border: 'border-stone-200 dark:border-stone-800',
      badge: 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400',
      status: 'empty',
    };
  }

  if (val >= 14.0) {
    return {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      text: 'text-emerald-700 dark:text-emerald-400',
      border: 'border-emerald-300 dark:border-emerald-800',
      badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300',
      status: 'passed',
    };
  }

  if (val >= 10.5) {
    return {
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-300 dark:border-amber-800',
      badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300',
      status: 'warning',
    };
  }

  return {
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-700 dark:text-rose-400',
    border: 'border-rose-300 dark:border-rose-800',
    badge: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300',
    status: 'failed',
  };
}

export function calculateCourse(
  course: CourseConfig,
  grades: Record<string, number | null>
): CourseCalculationResult {
  const g = (id: string): number | null => {
    const val = grades[id];
    return val !== undefined && val !== null && !isNaN(val) ? Number(val) : null;
  };

  const type = course.customCalcType;

  // 1. MAT 0 (Matemáticas Ciclo 0)
  if (type === 'mat0') {
    const pcs = [g('m1'), g('m2'), g('m3'), g('m4')];
    const weights = [2, 2, 3, 3];
    const totalW = 10;
    const ep = g('mep');
    const ef = g('mef');

    let ntSum = 0;
    let ntWeightSum = 0;
    pcs.forEach((v, i) => {
      if (v !== null) {
        ntSum += weights[i] * v;
        ntWeightSum += weights[i];
      }
    });

    const isNtComplete = pcs.every((v) => v !== null);
    const ntEst = ntWeightSum > 0 ? ntSum / ntWeightSum : null;

    let accum = 0;
    const missing: MissingEvaluation[] = [];

    if (ntEst !== null) {
      accum += 0.50 * ntEst;
    }
    if (ep !== null) accum += 0.20 * ep;
    if (ef !== null) accum += 0.30 * ef;

    const accNoNT = (ep !== null ? 0.20 * ep : 0) + (ef !== null ? 0.30 * ef : 0);
    const needNT = (PASSING_GRADE - accNoNT) / 0.50;

    // Hint for missing PCs
    ['m1', 'm2', 'm3', 'm4'].forEach((id, i) => {
      if (pcs[i] === null) {
        const remainingW = totalW - ntWeightSum;
        const needed = remainingW > 0 ? (needNT * totalW - ntSum) / weights[i] : null;
        missing.push({
          id,
          name: `PC${i + 1} (Peso ${weights[i]})`,
          weight: 0.50 * (weights[i] / totalW),
          neededFor11: needed,
          neededFor14: remainingW > 0 ? ((14 - accNoNT) / 0.50 * totalW - ntSum) / weights[i] : null,
          neededFor16: remainingW > 0 ? ((16 - accNoNT) / 0.50 * totalW - ntSum) / weights[i] : null,
        });
      }
    });

    if (ep === null) {
      const needed = (PASSING_GRADE - ((isNtComplete ? 0.50 * (ntEst || 0) : 0.50 * (ntEst || 0)) + (ef !== null ? 0.30 * ef : 0))) / 0.20;
      missing.push({
        id: 'mep',
        name: 'Examen Parcial',
        weight: 0.20,
        neededFor11: needed,
        neededFor14: (14 - ((isNtComplete ? 0.50 * (ntEst || 0) : 0.50 * (ntEst || 0)) + (ef !== null ? 0.30 * ef : 0))) / 0.20,
        neededFor16: (16 - ((isNtComplete ? 0.50 * (ntEst || 0) : 0.50 * (ntEst || 0)) + (ef !== null ? 0.30 * ef : 0))) / 0.20,
      });
    }

    if (ef === null) {
      const needed = (PASSING_GRADE - ((isNtComplete ? 0.50 * (ntEst || 0) : 0.50 * (ntEst || 0)) + (ep !== null ? 0.20 * ep : 0))) / 0.30;
      missing.push({
        id: 'mef',
        name: 'Examen Final',
        weight: 0.30,
        neededFor11: needed,
        neededFor14: (14 - ((isNtComplete ? 0.50 * (ntEst || 0) : 0.50 * (ntEst || 0)) + (ep !== null ? 0.20 * ep : 0))) / 0.30,
        neededFor16: (16 - ((isNtComplete ? 0.50 * (ntEst || 0) : 0.50 * (ntEst || 0)) + (ep !== null ? 0.20 * ep : 0))) / 0.30,
      });
    }

    const isComplete = isNtComplete && ep !== null && ef !== null;
    const finalGrade = isComplete ? Math.round(accum * 10) / 10 : null;
    return buildResult(accum, isComplete, finalGrade, missing);
  }

  // 2. INF 0 (Informática Ciclo 0)
  if (type === 'inf0') {
    const cs = [g('ic1'), g('ic2'), g('ic3')];
    const vC = cs.filter((x): x is number => x !== null);
    const pcAvg = vC.length ? vC.reduce((a, b) => a + b, 0) / vC.length : null;
    const [pc1, pc2, ep, ef] = [g('ipc1'), g('ipc2'), g('iep'), g('ief')];

    let ntAccum = 0;
    if (pc1 !== null) ntAccum += 0.35 * pc1;
    if (pc2 !== null) ntAccum += 0.45 * pc2;
    if (pcAvg !== null) ntAccum += 0.20 * pcAvg;

    const ntFull = pc1 !== null && pc2 !== null && vC.length === 3;
    const ntVal = ntFull ? ntAccum : ntAccum;

    let accum = 0;
    if (ntAccum > 0 || (pc1 !== null || pc2 !== null || pcAvg !== null)) {
      accum += 0.35 * ntVal;
    }
    if (ep !== null) accum += 0.30 * ep;
    if (ef !== null) accum += 0.35 * ef;

    const missing: MissingEvaluation[] = [];
    const aSN = (ep !== null ? 0.30 * ep : 0) + (ef !== null ? 0.35 * ef : 0);
    const needNT = (PASSING_GRADE - aSN) / 0.35;

    if (pc1 === null) {
      const needed = (needNT - (pc2 !== null ? 0.45 * pc2 : 0) - (pcAvg !== null ? 0.20 * pcAvg : 0)) / 0.35;
      missing.push({
        id: 'ipc1',
        name: 'Práctica Calificada 1',
        weight: 0.35 * 0.35,
        neededFor11: needed,
        neededFor14: ((14 - aSN) / 0.35 - (pc2 !== null ? 0.45 * pc2 : 0) - (pcAvg !== null ? 0.20 * pcAvg : 0)) / 0.35,
        neededFor16: ((16 - aSN) / 0.35 - (pc2 !== null ? 0.45 * pc2 : 0) - (pcAvg !== null ? 0.20 * pcAvg : 0)) / 0.35,
      });
    }

    if (pc2 === null) {
      const needed = (needNT - (pc1 !== null ? 0.35 * pc1 : 0) - (pcAvg !== null ? 0.20 * pcAvg : 0)) / 0.45;
      missing.push({
        id: 'ipc2',
        name: 'Práctica Calificada 2',
        weight: 0.35 * 0.45,
        neededFor11: needed,
        neededFor14: ((14 - aSN) / 0.35 - (pc1 !== null ? 0.35 * pc1 : 0) - (pcAvg !== null ? 0.20 * pcAvg : 0)) / 0.45,
        neededFor16: ((16 - aSN) / 0.35 - (pc1 !== null ? 0.35 * pc1 : 0) - (pcAvg !== null ? 0.20 * pcAvg : 0)) / 0.45,
      });
    }

    ['ic1', 'ic2', 'ic3'].forEach((id, i) => {
      if (cs[i] === null) {
        const nPC = (needNT - (pc1 !== null ? 0.35 * pc1 : 0) - (pc2 !== null ? 0.45 * pc2 : 0)) / 0.20;
        const kS = vC.reduce((a, b) => a + b, 0);
        const mC = cs.filter((x) => x === null).length;
        missing.push({
          id,
          name: `Control de Lab ${i + 1}`,
          weight: (0.35 * 0.20) / 3,
          neededFor11: mC > 0 ? (nPC * 3 - kS) / mC : null,
          neededFor14: mC > 0 ? (((14 - aSN) / 0.35 - (pc1 !== null ? 0.35 * pc1 : 0) - (pc2 !== null ? 0.45 * pc2 : 0)) / 0.20 * 3 - kS) / mC : null,
          neededFor16: mC > 0 ? (((16 - aSN) / 0.35 - (pc1 !== null ? 0.35 * pc1 : 0) - (pc2 !== null ? 0.45 * pc2 : 0)) / 0.20 * 3 - kS) / mC : null,
        });
      }
    });

    if (ep === null) {
      const needed = (PASSING_GRADE - (0.35 * ntVal + (ef !== null ? 0.35 * ef : 0))) / 0.30;
      missing.push({
        id: 'iep',
        name: 'Examen Parcial',
        weight: 0.30,
        neededFor11: needed,
        neededFor14: (14 - (0.35 * ntVal + (ef !== null ? 0.35 * ef : 0))) / 0.30,
        neededFor16: (16 - (0.35 * ntVal + (ef !== null ? 0.35 * ef : 0))) / 0.30,
      });
    }

    if (ef === null) {
      const needed = (PASSING_GRADE - (0.35 * ntVal + (ep !== null ? 0.30 * ep : 0))) / 0.35;
      missing.push({
        id: 'ief',
        name: 'Examen Final',
        weight: 0.35,
        neededFor11: needed,
        neededFor14: (14 - (0.35 * ntVal + (ep !== null ? 0.30 * ep : 0))) / 0.35,
        neededFor16: (16 - (0.35 * ntVal + (ep !== null ? 0.30 * ep : 0))) / 0.35,
      });
    }

    const isComplete = ntFull && ep !== null && ef !== null;
    const finalGrade = isComplete ? Math.round(accum * 10) / 10 : null;
    return buildResult(accum, isComplete, finalGrade, missing);
  }

  // 3. LEN 0 (Lenguaje Ciclo 0)
  if (type === 'len0') {
    const ps = [g('lp1'), g('lp2'), g('lp3')];
    const vP = ps.filter((x): x is number => x !== null);
    const pp = vP.length ? vP.reduce((a, b) => a + b, 0) / vP.length : null;
    const ep = g('lep');
    const ef = g('lef');

    let accum = 0;
    if (pp !== null) accum += 0.40 * pp;
    if (ep !== null) accum += 0.30 * ep;
    if (ef !== null) accum += 0.30 * ef;

    const missing: MissingEvaluation[] = [];
    const nPP = (PASSING_GRADE - (ep !== null ? 0.30 * ep : 0) - (ef !== null ? 0.30 * ef : 0)) / 0.40;
    const kS = vP.reduce((a, x) => a + x, 0);
    const mC = ps.filter((x) => x === null).length;

    ['lp1', 'lp2', 'lp3'].forEach((id, i) => {
      if (ps[i] === null) {
        missing.push({
          id,
          name: `Práctica Calificada ${i + 1}`,
          weight: 0.40 / 3,
          neededFor11: mC > 0 ? (nPP * 3 - kS) / mC : null,
          neededFor14: mC > 0 ? (((14 - (ep !== null ? 0.30 * ep : 0) - (ef !== null ? 0.30 * ef : 0)) / 0.40) * 3 - kS) / mC : null,
          neededFor16: mC > 0 ? (((16 - (ep !== null ? 0.30 * ep : 0) - (ef !== null ? 0.30 * ef : 0)) / 0.40) * 3 - kS) / mC : null,
        });
      }
    });

    if (ep === null) {
      missing.push({
        id: 'lep',
        name: 'Examen Parcial',
        weight: 0.30,
        neededFor11: (PASSING_GRADE - (pp !== null ? 0.40 * pp : 0) - (ef !== null ? 0.30 * ef : 0)) / 0.30,
        neededFor14: (14 - (pp !== null ? 0.40 * pp : 0) - (ef !== null ? 0.30 * ef : 0)) / 0.30,
        neededFor16: (16 - (pp !== null ? 0.40 * pp : 0) - (ef !== null ? 0.30 * ef : 0)) / 0.30,
      });
    }

    if (ef === null) {
      missing.push({
        id: 'lef',
        name: 'Examen Final',
        weight: 0.30,
        neededFor11: (PASSING_GRADE - (pp !== null ? 0.40 * pp : 0) - (ep !== null ? 0.30 * ep : 0)) / 0.30,
        neededFor14: (14 - (pp !== null ? 0.40 * pp : 0) - (ep !== null ? 0.30 * ep : 0)) / 0.30,
        neededFor16: (16 - (pp !== null ? 0.40 * pp : 0) - (ep !== null ? 0.30 * ep : 0)) / 0.30,
      });
    }

    const isComplete = vP.length === 3 && ep !== null && ef !== null;
    const finalGrade = isComplete ? Math.round(accum * 10) / 10 : null;
    return buildResult(accum, isComplete, finalGrade, missing);
  }

  // 4. CON 0 (Contabilidad Ciclo 0)
  if (type === 'con0') {
    const cls = [g('ccl1'), g('ccl2')];
    const vCL = cls.filter((x): x is number => x !== null);
    const rcl = vCL.length ? vCL.reduce((a, b) => a + b, 0) / vCL.length : null;

    const pcs = [g('cp1'), g('cp2'), g('cp3'), g('cp4'), g('cp5')];
    const vPC = pcs.filter((x): x is number => x !== null);
    const rpc = vPC.length ? vPC.reduce((a, b) => a + b, 0) / vPC.length : null;

    const [prt, ep, ef] = [g('cprt'), g('cep'), g('cef')];

    let tP = 0;
    if (rcl !== null) tP += 0.25 * rcl;
    if (rpc !== null) tP += 0.70 * rpc;
    if (prt !== null) tP += 0.05 * prt;

    const rtFull = vCL.length === 2 && vPC.length === 5 && prt !== null;
    const rt = tP;

    let accum = 0;
    accum += 0.40 * rt;
    if (ep !== null) accum += 0.30 * ep;
    if (ef !== null) accum += 0.30 * ef;

    const missing: MissingEvaluation[] = [];
    const aSN = (ep !== null ? 0.30 * ep : 0) + (ef !== null ? 0.30 * ef : 0);
    const needRT = (PASSING_GRADE - aSN) / 0.40;

    // missing CLs
    const nRCL = (needRT - (rpc !== null ? 0.70 * rpc : 0) - (prt !== null ? 0.05 * prt : 0)) / 0.25;
    const kS_cl = vCL.reduce((a, x) => a + x, 0);
    const mC_cl = cls.filter((x) => x === null).length;
    ['ccl1', 'ccl2'].forEach((id, i) => {
      if (cls[i] === null) {
        missing.push({
          id,
          name: `Control de Lectura ${i + 1}`,
          weight: (0.40 * 0.25) / 2,
          neededFor11: mC_cl > 0 ? (nRCL * 2 - kS_cl) / mC_cl : null,
          neededFor14: null,
          neededFor16: null,
        });
      }
    });

    // missing PCs
    const nRPC = (needRT - (rcl !== null ? 0.25 * rcl : 0) - (prt !== null ? 0.05 * prt : 0)) / 0.70;
    const kS_pc = vPC.reduce((a, x) => a + x, 0);
    const mC_pc = pcs.filter((x) => x === null).length;
    ['cp1', 'cp2', 'cp3', 'cp4', 'cp5'].forEach((id, i) => {
      if (pcs[i] === null) {
        missing.push({
          id,
          name: `Práctica Calificada ${i + 1}`,
          weight: (0.40 * 0.70) / 5,
          neededFor11: mC_pc > 0 ? (nRPC * 5 - kS_pc) / mC_pc : null,
          neededFor14: null,
          neededFor16: null,
        });
      }
    });

    if (prt === null) {
      missing.push({
        id: 'cprt',
        name: 'Participación',
        weight: 0.40 * 0.05,
        neededFor11: (needRT - (rcl !== null ? 0.25 * rcl : 0) - (rpc !== null ? 0.70 * rpc : 0)) / 0.05,
        neededFor14: null,
        neededFor16: null,
      });
    }

    if (ep === null) {
      missing.push({
        id: 'cep',
        name: 'Examen Parcial',
        weight: 0.30,
        neededFor11: (PASSING_GRADE - 0.40 * rt - (ef !== null ? 0.30 * ef : 0)) / 0.30,
        neededFor14: (14 - 0.40 * rt - (ef !== null ? 0.30 * ef : 0)) / 0.30,
        neededFor16: (16 - 0.40 * rt - (ef !== null ? 0.30 * ef : 0)) / 0.30,
      });
    }

    if (ef === null) {
      missing.push({
        id: 'cef',
        name: 'Examen Final',
        weight: 0.30,
        neededFor11: (PASSING_GRADE - 0.40 * rt - (ep !== null ? 0.30 * ep : 0)) / 0.30,
        neededFor14: (14 - 0.40 * rt - (ep !== null ? 0.30 * ep : 0)) / 0.30,
        neededFor16: (16 - 0.40 * rt - (ep !== null ? 0.30 * ep : 0)) / 0.30,
      });
    }

    const isComplete = rtFull && ep !== null && ef !== null;
    const finalGrade = isComplete ? Math.round(accum * 10) / 10 : null;
    return buildResult(accum, isComplete, finalGrade, missing);
  }

  // 5. EMP 0 (Cs. Empresariales Ciclo 0)
  if (type === 'emp0') {
    const clIds = ['ecl1', 'ecl2', 'ecl3', 'ecl4'];
    const clVals = clIds.map(g);
    const vCL = clVals.filter((x): x is number => x !== null);
    const rcl = vCL.length ? vCL.reduce((a, b) => a + b, 0) / vCL.length : null;
    const clFull = vCL.length === 4;

    const otherFields: [string, number, string][] = [
      ['eav1', 0.05, 'Avance 1'],
      ['eav2', 0.10, 'Avance 2'],
      ['eens', 0.15, 'Ensayo'],
      ['eep', 0.25, 'Examen Parcial'],
      ['eef', 0.25, 'Examen Final'],
    ];

    let accum = 0;
    if (rcl !== null) accum += 0.20 * rcl;

    const missing: MissingEvaluation[] = [];

    otherFields.forEach(([id, w, label]) => {
      const v = g(id);
      if (v !== null) {
        accum += w * v;
      } else {
        missing.push({
          id,
          name: label,
          weight: w,
          neededFor11: (PASSING_GRADE - accum) / w,
          neededFor14: (14 - accum) / w,
          neededFor16: (16 - accum) / w,
        });
      }
    });

    if (!clFull) {
      const aNoCL = accum - (rcl !== null ? 0.20 * rcl : 0);
      const nCL = (PASSING_GRADE - aNoCL) / 0.20;
      const kS = vCL.reduce((a, b) => a + b, 0);
      const mC = 4 - vCL.length;
      clIds.forEach((id, i) => {
        if (clVals[i] === null) {
          missing.push({
            id,
            name: `Control de Lectura ${i + 1}`,
            weight: 0.20 / 4,
            neededFor11: mC > 0 ? (nCL * 4 - kS) / mC : null,
            neededFor14: mC > 0 ? (((14 - aNoCL) / 0.20) * 4 - kS) / mC : null,
            neededFor16: mC > 0 ? (((16 - aNoCL) / 0.20) * 4 - kS) / mC : null,
          });
        }
      });
    }

    const isComplete = clFull && otherFields.every(([id]) => g(id) !== null);
    const finalGrade = isComplete ? Math.round(accum * 10) / 10 : null;
    return buildResult(accum, isComplete, finalGrade, missing);
  }

  // 6. MAT 1 (Matemáticas I Ciclo 1)
  if (type === 'mat1') {
    const pcs = ['c1m1', 'c1m2', 'c1m3', 'c1m4'].map(g);
    const cs = ['c1mc1', 'c1mc2'].map(g);
    const ep = g('c1mep');
    const ef = g('c1mef');

    let accum = 0;
    const missing: MissingEvaluation[] = [];

    pcs.forEach((v, i) => {
      if (v !== null) accum += 0.09 * v;
      else {
        missing.push({
          id: `c1m${i + 1}`,
          name: `PC ${i + 1}`,
          weight: 0.09,
          neededFor11: (PASSING_GRADE - accum) / 0.09,
          neededFor14: (14 - accum) / 0.09,
          neededFor16: (16 - accum) / 0.09,
        });
      }
    });

    cs.forEach((v, i) => {
      if (v !== null) accum += 0.02 * v;
      else {
        missing.push({
          id: `c1mc${i + 1}`,
          name: `Control ${i + 1}`,
          weight: 0.02,
          neededFor11: (PASSING_GRADE - accum) / 0.02,
          neededFor14: (14 - accum) / 0.02,
          neededFor16: (16 - accum) / 0.02,
        });
      }
    });

    if (ep !== null) accum += 0.30 * ep;
    else {
      missing.push({
        id: 'c1mep',
        name: 'Examen Parcial',
        weight: 0.30,
        neededFor11: (PASSING_GRADE - accum) / 0.30,
        neededFor14: (14 - accum) / 0.30,
        neededFor16: (16 - accum) / 0.30,
      });
    }

    if (ef !== null) accum += 0.30 * ef;
    else {
      missing.push({
        id: 'c1mef',
        name: 'Examen Final',
        weight: 0.30,
        neededFor11: (PASSING_GRADE - accum) / 0.30,
        neededFor14: (14 - accum) / 0.30,
        neededFor16: (16 - accum) / 0.30,
      });
    }

    const isComplete = missing.length === 0;
    const finalGrade = isComplete ? Math.round(accum * 10) / 10 : null;
    return buildResult(accum, isComplete, finalGrade, missing);
  }

  // 7. ECO 1 (Economía General I Ciclo 1)
  if (type === 'eco1') {
    const pcs = ['c1e1', 'c1e2', 'c1e3', 'c1e4'].map(g);
    const vP = pcs.filter((x): x is number => x !== null);
    const pcAvg = vP.length ? vP.reduce((a, b) => a + b, 0) / vP.length : null;
    const ep = g('c1eep');
    const ef = g('c1eef');

    let accum = 0;
    if (pcAvg !== null) accum += 0.40 * pcAvg;
    if (ep !== null) accum += 0.30 * ep;
    if (ef !== null) accum += 0.30 * ef;

    const missing: MissingEvaluation[] = [];
    const nPCAvg = (PASSING_GRADE - (ep !== null ? 0.30 * ep : 0) - (ef !== null ? 0.30 * ef : 0)) / 0.40;
    const kS = vP.reduce((a, b) => a + b, 0);
    const mC = pcs.filter((x) => x === null).length;

    ['c1e1', 'c1e2', 'c1e3', 'c1e4'].forEach((id, i) => {
      if (pcs[i] === null) {
        missing.push({
          id,
          name: `Práctica Calificada ${i + 1}`,
          weight: 0.10,
          neededFor11: mC > 0 ? (nPCAvg * 4 - kS) / mC : null,
          neededFor14: mC > 0 ? (((14 - (ep !== null ? 0.30 * ep : 0) - (ef !== null ? 0.30 * ef : 0)) / 0.40) * 4 - kS) / mC : null,
          neededFor16: mC > 0 ? (((16 - (ep !== null ? 0.30 * ep : 0) - (ef !== null ? 0.30 * ef : 0)) / 0.40) * 4 - kS) / mC : null,
        });
      }
    });

    if (ep === null) {
      missing.push({
        id: 'c1eep',
        name: 'Examen Parcial',
        weight: 0.30,
        neededFor11: (PASSING_GRADE - (vP.length === 4 ? 0.40 * (pcAvg || 0) : 0) - (ef !== null ? 0.30 * ef : 0)) / 0.30,
        neededFor14: (14 - (vP.length === 4 ? 0.40 * (pcAvg || 0) : 0) - (ef !== null ? 0.30 * ef : 0)) / 0.30,
        neededFor16: (16 - (vP.length === 4 ? 0.40 * (pcAvg || 0) : 0) - (ef !== null ? 0.30 * ef : 0)) / 0.30,
      });
    }

    if (ef === null) {
      missing.push({
        id: 'c1eef',
        name: 'Examen Final',
        weight: 0.30,
        neededFor11: (PASSING_GRADE - (vP.length === 4 ? 0.40 * (pcAvg || 0) : 0) - (ep !== null ? 0.30 * ep : 0)) / 0.30,
        neededFor14: (14 - (vP.length === 4 ? 0.40 * (pcAvg || 0) : 0) - (ep !== null ? 0.30 * ep : 0)) / 0.30,
        neededFor16: (16 - (vP.length === 4 ? 0.40 * (pcAvg || 0) : 0) - (ep !== null ? 0.30 * ep : 0)) / 0.30,
      });
    }

    const isComplete = vP.length === 4 && ep !== null && ef !== null;
    const finalGrade = isComplete ? Math.round(accum * 10) / 10 : null;
    return buildResult(accum, isComplete, finalGrade, missing);
  }

  // 8. LEN 1 (Lenguaje I Ciclo 1)
  if (type === 'len1') {
    const pcs = ['c1l1', 'c1l2', 'c1l3'].map(g);
    const vP = pcs.filter((x): x is number => x !== null);
    const pcAvg = vP.length ? vP.reduce((a, b) => a + b, 0) / vP.length : null;
    const ep = g('c1lep');
    const ef = g('c1lef');

    let accum = 0;
    if (pcAvg !== null) accum += 0.35 * pcAvg;
    if (ep !== null) accum += 0.30 * ep;
    if (ef !== null) accum += 0.35 * ef;

    const missing: MissingEvaluation[] = [];
    const nPCAvg = (PASSING_GRADE - (ep !== null ? 0.30 * ep : 0) - (ef !== null ? 0.35 * ef : 0)) / 0.35;
    const kS = vP.reduce((a, b) => a + b, 0);
    const mC = pcs.filter((x) => x === null).length;

    ['c1l1', 'c1l2', 'c1l3'].forEach((id, i) => {
      if (pcs[i] === null) {
        missing.push({
          id,
          name: `Práctica Calificada ${i + 1}`,
          weight: 0.35 / 3,
          neededFor11: mC > 0 ? (nPCAvg * 3 - kS) / mC : null,
          neededFor14: mC > 0 ? (((14 - (ep !== null ? 0.30 * ep : 0) - (ef !== null ? 0.35 * ef : 0)) / 0.35) * 3 - kS) / mC : null,
          neededFor16: mC > 0 ? (((16 - (ep !== null ? 0.30 * ep : 0) - (ef !== null ? 0.35 * ef : 0)) / 0.35) * 3 - kS) / mC : null,
        });
      }
    });

    if (ep === null) {
      missing.push({
        id: 'c1lep',
        name: 'Examen Parcial',
        weight: 0.30,
        neededFor11: (PASSING_GRADE - (vP.length === 3 ? 0.35 * (pcAvg || 0) : 0) - (ef !== null ? 0.35 * ef : 0)) / 0.30,
        neededFor14: (14 - (vP.length === 3 ? 0.35 * (pcAvg || 0) : 0) - (ef !== null ? 0.35 * ef : 0)) / 0.30,
        neededFor16: (16 - (vP.length === 3 ? 0.35 * (pcAvg || 0) : 0) - (ef !== null ? 0.35 * ef : 0)) / 0.30,
      });
    }

    if (ef === null) {
      missing.push({
        id: 'c1lef',
        name: 'Examen Final',
        weight: 0.35,
        neededFor11: (PASSING_GRADE - (vP.length === 3 ? 0.35 * (pcAvg || 0) : 0) - (ep !== null ? 0.30 * ep : 0)) / 0.35,
        neededFor14: (14 - (vP.length === 3 ? 0.35 * (pcAvg || 0) : 0) - (ep !== null ? 0.30 * ep : 0)) / 0.35,
        neededFor16: (16 - (vP.length === 3 ? 0.35 * (pcAvg || 0) : 0) - (ep !== null ? 0.30 * ep : 0)) / 0.35,
      });
    }

    const isComplete = vP.length === 3 && ep !== null && ef !== null;
    const finalGrade = isComplete ? Math.round(accum * 10) / 10 : null;
    return buildResult(accum, isComplete, finalGrade, missing);
  }

  // 9. ETH 1 (Ética Ciclo 1)
  if (type === 'eth1') {
    const etg = g('c1etg');
    const etp = g('c1etp');
    const ep = g('c1etep');
    const ef = g('c1etef');

    let accum = 0;
    if (etg !== null) accum += 0.20 * etg;
    if (etp !== null) accum += 0.15 * etp;
    if (ep !== null) accum += 0.30 * ep;
    if (ef !== null) accum += 0.35 * ef;

    const missing: MissingEvaluation[] = [];

    if (etg === null) {
      missing.push({
        id: 'c1etg',
        name: 'Trabajos Grupales',
        weight: 0.20,
        neededFor11: (PASSING_GRADE - accum) / 0.20,
        neededFor14: (14 - accum) / 0.20,
        neededFor16: (16 - accum) / 0.20,
      });
    }

    if (etp === null) {
      missing.push({
        id: 'c1etp',
        name: 'Participación',
        weight: 0.15,
        neededFor11: (PASSING_GRADE - accum) / 0.15,
        neededFor14: (14 - accum) / 0.15,
        neededFor16: (16 - accum) / 0.15,
      });
    }

    if (ep === null) {
      missing.push({
        id: 'c1etep',
        name: 'Examen Parcial',
        weight: 0.30,
        neededFor11: (PASSING_GRADE - accum) / 0.30,
        neededFor14: (14 - accum) / 0.30,
        neededFor16: (16 - accum) / 0.30,
      });
    }

    if (ef === null) {
      missing.push({
        id: 'c1etef',
        name: 'Examen Final',
        weight: 0.35,
        neededFor11: (PASSING_GRADE - accum) / 0.35,
        neededFor14: (14 - accum) / 0.35,
        neededFor16: (16 - accum) / 0.35,
      });
    }

    const isComplete = etg !== null && etp !== null && ep !== null && ef !== null;
    const finalGrade = isComplete ? Math.round(accum * 10) / 10 : null;
    return buildResult(accum, isComplete, finalGrade, missing);
  }

  // STANDARD GENERIC COURSE (for custom courses)
  let accum = 0;
  const missing: MissingEvaluation[] = [];
  let totalEvaluations = 0;
  let filledEvaluations = 0;

  course.groups.forEach((group) => {
    if (group.type === 'simple_average') {
      const items = group.items;
      const vals = items.map((i) => g(i.id));
      const valid = vals.filter((v): v is number => v !== null);
      totalEvaluations += items.length;
      filledEvaluations += valid.length;

      if (valid.length > 0) {
        const avg = valid.reduce((a, b) => a + b, 0) / valid.length;
        accum += group.weightInCourse * avg;
      }

      items.forEach((item, idx) => {
        if (vals[idx] === null) {
          missing.push({
            id: item.id,
            name: item.name,
            weight: group.weightInCourse / items.length,
            neededFor11: (PASSING_GRADE - accum) / (group.weightInCourse / items.length),
            neededFor14: (14 - accum) / (group.weightInCourse / items.length),
            neededFor16: (16 - accum) / (group.weightInCourse / items.length),
          });
        }
      });
    } else {
      group.items.forEach((item) => {
        totalEvaluations += 1;
        const val = g(item.id);
        const w = item.weight <= 1 ? item.weight : item.weight / 100;
        if (val !== null) {
          filledEvaluations += 1;
          accum += w * val;
        } else {
          missing.push({
            id: item.id,
            name: item.name,
            weight: w,
            neededFor11: (PASSING_GRADE - accum) / w,
            neededFor14: (14 - accum) / w,
            neededFor16: (16 - accum) / w,
          });
        }
      });
    }
  });

  const isComplete = totalEvaluations > 0 && totalEvaluations === filledEvaluations;
  const finalGrade = isComplete ? Math.round(accum * 10) / 10 : null;
  return buildResult(accum, isComplete, finalGrade, missing);
}

function buildResult(
  accum: number,
  isComplete: boolean,
  finalGrade: number | null,
  missing: MissingEvaluation[]
): CourseCalculationResult {
  const roundedAccum = Math.round(accum * 10) / 10;
  const totalMissingWeight = missing.reduce((s, m) => s + m.weight, 0);

  const neededAverageFor11 =
    totalMissingWeight > 0 ? Math.max(0, (PASSING_GRADE - roundedAccum) / totalMissingWeight) : null;
  const neededAverageFor14 =
    totalMissingWeight > 0 ? Math.max(0, (MERIT_GRADE - roundedAccum) / totalMissingWeight) : null;
  const neededAverageFor16 =
    totalMissingWeight > 0 ? Math.max(0, (EXCELLENCE_GRADE - roundedAccum) / totalMissingWeight) : null;

  let status: 'passed' | 'failed' | 'in_progress' | 'impossible' | 'empty' = 'in_progress';
  let statusLabel = 'En curso';

  if (isComplete) {
    if ((finalGrade || 0) >= PASSING_GRADE) {
      status = 'passed';
      statusLabel = 'Aprobado';
    } else {
      status = 'failed';
      statusLabel = 'Desaprobado';
    }
  } else if (roundedAccum >= PASSING_GRADE) {
    status = 'passed';
    statusLabel = '¡Ya aseguraste 11!';
  } else if (neededAverageFor11 !== null && neededAverageFor11 > 20.0) {
    status = 'impossible';
    statusLabel = 'Q.E.P.D. Imposible';
  } else if (roundedAccum === 0 && missing.length > 0) {
    status = 'empty';
    statusLabel = 'Sin notas';
  }

  // Progress towards passing grade (11 is 100% of minimum passing)
  const progressPercent = Math.min(100, Math.round((roundedAccum / PASSING_GRADE) * 100));

  return {
    accumulated: roundedAccum,
    isComplete,
    finalGrade,
    currentEstimatedGrade: roundedAccum,
    missingEvaluations: missing,
    neededAverageFor11,
    neededAverageFor14,
    neededAverageFor16,
    status,
    statusLabel,
    progressPercent,
    scorePercent: Math.min(100, Math.round(((finalGrade ?? roundedAccum) / 20) * 100)),
  };
}

export function calculateSemesterGPA(
  courses: CourseConfig[],
  grades: Record<string, number | null>
): {
  gpa: number | null;
  totalCredits: number;
  completedCredits: number;
  approvedCount: number;
  failedCount: number;
  inProgressCount: number;
  academicStanding: string;
} {
  let weightedPoints = 0;
  let totalCreditsWithGrades = 0;
  let totalCredits = 0;
  let approvedCount = 0;
  let failedCount = 0;
  let inProgressCount = 0;

  courses.forEach((course) => {
    totalCredits += course.credits;
    const calc = calculateCourse(course, grades);
    const grade = calc.isComplete ? calc.finalGrade : calc.currentEstimatedGrade;

    if (calc.isComplete) {
      if ((calc.finalGrade || 0) >= PASSING_GRADE) approvedCount++;
      else failedCount++;
    } else if (calc.accumulated > 0) {
      inProgressCount++;
      if (calc.accumulated >= PASSING_GRADE) approvedCount++;
    } else {
      inProgressCount++;
    }

    if (grade !== null && grade > 0) {
      weightedPoints += grade * course.credits;
      totalCreditsWithGrades += course.credits;
    }
  });

  const gpa =
    totalCreditsWithGrades > 0
      ? Math.round((weightedPoints / totalCreditsWithGrades) * 100) / 100
      : null;

  let academicStanding = 'Iniciando ciclo';
  if (gpa !== null) {
    if (gpa >= 16.0) academicStanding = 'Décimo Superior 🏆';
    else if (gpa >= 14.5) academicStanding = 'Tercio Superior 🌟';
    else if (gpa >= 13.0) academicStanding = 'Buen Rendimiento 📘';
    else if (gpa >= 11.0) academicStanding = 'Regular / Aprobatorio 🌱';
    else academicStanding = 'En Riesgo Académico ⚠️';
  }

  return {
    gpa,
    totalCredits,
    completedCredits: totalCreditsWithGrades,
    approvedCount,
    failedCount,
    inProgressCount,
    academicStanding,
  };
}
