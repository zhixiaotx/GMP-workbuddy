import React, { useState } from 'react';
import { Eye, ArrowDownToLine, RefreshCw, AlertCircle, FolderDown, FileSpreadsheet, PlusCircle, ShieldAlert, CheckCircle2, Clock, Play } from 'lucide-react';
import { AutomationLog } from '../types';

interface LedgerRow {
  batchNo: string;
  material: string;
  assay: number;
  lod: number;
  decision: '合格 (Conform)' | '不合格 (OOS)';
  timestamp: string;
}

export default function FolderWatcher() {
  const [ledger, setLedger] = useState<LedgerRow[]>([
    { batchNo: 'B20260810-01', material: '头孢呋辛钠原料药', assay: 99.4, lod: 0.32, decision: '合格 (Conform)', timestamp: '2026-08-10 10:15:30' },
    { batchNo: 'B20260815-04', material: '盐酸头孢他美钠', assay: 98.7, lod: 0.45, decision: '合格 (Conform)', timestamp: '2026-08-15 14:22:11' },
    { batchNo: 'B20260818-02', material: '无菌注射用水 (WFI)', assay: 100.0, lod: 0.05, decision: '合格 (Conform)', timestamp: '2026-08-18 09:05:45' }
  ]);

  const [autoLogs, setAutoLogs] = useState<AutomationLog[]>([
    { id: 'log-1', timestamp: '2026-08-19 14:00:10', type: 'COA解析', filename: 'COA_Cefuroxime_B12.csv', status: 'success', message: '成功提取批号 B12，Assay 99.4%，已归入台账。' }
  ]);

  const [activeFileInWatcher, setActiveFileInWatcher] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  // Trigger COA drop (Exercise 15)
  const handleSimulateCoaDrop = (isOos: boolean) => {
    if (processing) return;
    const filename = isOos ? 'COA_CEPH_OOS_95.csv' : `COA_CEPH_PASS_${Math.floor(Math.random() * 900) + 100}.csv`;
    setActiveFileInWatcher(filename);
    setProcessing(true);

    // Timeline Animation
    setTimeout(() => {
      // Step 2: Extraction & Rules comparison
      const batchNo = `B20260819-${Math.floor(Math.random() * 90) + 10}`;
      const assay = isOos ? 95.4 : parseFloat((98.5 + Math.random() * 3).toFixed(2));
      const lod = isOos ? 1.45 : parseFloat((0.2 + Math.random() * 0.4).toFixed(2));
      const decision = (assay >= 98.0 && lod <= 1.0) ? '合格 (Conform)' : '不合格 (OOS)';

      setLedger(prev => [
        {
          batchNo,
          material: '头孢呋辛钠原料药',
          assay,
          lod,
          decision,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19)
        },
        ...prev
      ]);

      setAutoLogs(prev => [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
          type: 'COA解析',
          filename,
          status: decision === '合格 (Conform)' ? 'success' : 'failed',
          message: `自动捕获COA：解析批号 ${batchNo}，含量 Assay: ${assay}% (规程要求≥98%)，水分 LOD: ${lod}% (规程要求≤1.0%)。判定结论：${decision}`
        },
        ...prev
      ]);

      setProcessing(false);
      setActiveFileInWatcher(null);
    }, 2000);
  };

  // Trigger Deviation drop (Exercise 16)
  const handleSimulateDeviationDrop = () => {
    if (processing) return;
    const filename = 'INCIDENT_ROOM103_TEMPERATURE_ALERT.json';
    setActiveFileInWatcher(filename);
    setProcessing(true);

    setTimeout(() => {
      const devNo = `DEV-AUTO-2026-${Math.floor(Math.random() * 900) + 100}`;
      
      setAutoLogs(prev => [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
          type: '偏差报告生成',
          filename,
          status: 'success',
          message: `检测到车间温度超标报警JSON。自动撰写标准偏差并存储至 [/workspace/reports/] 文件夹。已生成偏差文书 ${devNo} 待签批。`
        },
        ...prev
      ]);

      setProcessing(false);
      setActiveFileInWatcher(null);
      alert(`自动化脚本成功运行：\n已抓取温度传感器遥测记录，智能套用标准偏差表单，生成并输出 GMP 偏差草稿报告：${devNo}.txt`);
    }, 2200);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm p-4 space-y-4">
      {/* Title */}
      <div>
        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-emerald-600 animate-pulse" />
          医药任务流定时触发与监听自动化 (Workbuddy File Watcher & Ledger)
        </h4>
        <p className="text-xs text-slate-500 mt-1">
          模拟对本地文件夹的自动监听。一旦放置 COA 报表或偏差 JSON，立即执行解析提取并追加写入系统主台账。
        </p>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Left Watcher Column */}
        <div className="col-span-5 border border-slate-200 rounded-xl bg-slate-50 p-4 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FolderDown className="w-4 h-4 text-emerald-600 animate-bounce" />
                监听目标目录: <span className="font-mono text-[11px] text-emerald-700">/workspace/inbox/</span>
              </span>
              <span className="px-1.5 py-0.5 bg-emerald-500 text-white font-bold text-[9px] rounded-full">
                监听中 (Live)
              </span>
            </div>

            {/* Folder Dropzone Graphic */}
            <div className="border-2 border-dashed border-slate-200 bg-white rounded-lg p-5 flex flex-col items-center justify-center text-center relative h-36">
              {processing && activeFileInWatcher ? (
                <div className="space-y-2 flex flex-col items-center">
                  <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
                  <p className="text-xs font-semibold text-slate-700 animate-pulse">正在解析：{activeFileInWatcher}</p>
                  <p className="text-[10px] text-slate-400">正在对比检验标准、计算水分及 Assay 趋势...</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <FileSpreadsheet className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-600">文件夹为空</p>
                  <p className="text-[10px] text-slate-400">正在监听并等待新的 COA 或偏差文件丢入</p>
                </div>
              )}
            </div>
          </div>

          {/* Simulate actions */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              仿真触发动作 (Drop file)
            </span>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => handleSimulateCoaDrop(false)}
                disabled={processing}
                className="w-full py-2 bg-white hover:bg-emerald-50 hover:text-emerald-700 disabled:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <PlusCircle className="w-3.5 h-3.5 text-emerald-500" />
                丢入合格原料 COA.csv (自动增台账)
              </button>
              <button
                onClick={() => handleSimulateCoaDrop(true)}
                disabled={processing}
                className="w-full py-2 bg-white hover:bg-red-50 hover:text-red-700 disabled:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
                丢入不合格 COA.csv (触发 OOS 报警)
              </button>
              <button
                onClick={handleSimulateDeviationDrop}
                disabled={processing}
                className="w-full py-2 bg-white hover:bg-purple-50 hover:text-purple-700 disabled:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <Play className="w-3.5 h-3.5 text-purple-500" />
                丢入偏差报警.json (自动起草整改文书)
              </button>
            </div>
          </div>
        </div>

        {/* Right Ledger Database Column */}
        <div className="col-span-7 flex flex-col min-h-0 space-y-3">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wide">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            企业检验主台账 (Master Lab Ledger)
          </span>

          {/* Table */}
          <div className="border border-slate-200 rounded-lg overflow-hidden flex-1 max-h-56 overflow-y-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                  <th className="p-2 border-r border-slate-200">原料批号</th>
                  <th className="p-2 border-r border-slate-200">物料名称</th>
                  <th className="p-2 border-r border-slate-200 text-center">活性 Assay%</th>
                  <th className="p-2 border-r border-slate-200 text-center">干燥失重 LOD%</th>
                  <th className="p-2 text-center">核准判定</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 font-mono">
                {ledger.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="p-2 border-r border-slate-150 font-semibold text-slate-800">{row.batchNo}</td>
                    <td className="p-2 border-r border-slate-150 font-sans text-slate-700">{row.material}</td>
                    <td className={`p-2 border-r border-slate-150 text-center font-bold ${row.assay < 98.0 ? 'text-red-600 bg-red-50' : 'text-slate-700'}`}>
                      {row.assay}%
                    </td>
                    <td className={`p-2 border-r border-slate-150 text-center font-bold ${row.lod > 1.0 ? 'text-red-600 bg-red-50' : 'text-slate-700'}`}>
                      {row.lod}%
                    </td>
                    <td className="p-2 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-sans ${
                        row.decision.includes('合格')
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {row.decision}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Process/Auto Logs */}
          <div className="space-y-1.5 flex-1 max-h-40 overflow-y-auto border border-slate-200 rounded-lg p-3 bg-slate-50/50">
            <span className="block text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              后台自动化监听流水日志 (Automation Logs)
            </span>
            <div className="space-y-1.5">
              {autoLogs.map((log) => (
                <div key={log.id} className="bg-white border border-slate-200 p-2 rounded text-[10px] leading-relaxed flex gap-2">
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ${
                    log.status === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {log.type} {log.status === 'success' ? 'SUCCESS' : 'ALERT'}
                  </span>
                  <div className="text-slate-600">
                    <span className="font-semibold text-slate-700 mr-1">[{log.filename}]</span>
                    {log.message}
                    <span className="block text-[9px] text-slate-400 mt-0.5">{log.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
