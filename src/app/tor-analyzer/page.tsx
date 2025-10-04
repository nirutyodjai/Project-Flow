'use client';

import { useState } from 'react';
import { Calculator, Plus, Trash2, FileText, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

export default function TORAnalyzerPage() {
  const [projectName, setProjectName] = useState('');
  const [budget, setBudget] = useState('');
  const [workItems, setWorkItems] = useState<any[]>([
    {
      name: '',
      description: '',
      quantity: 1,
      unit: 'งาน',
      materialCost: 0,
      laborCost: 0,
      equipmentCost: 0,
    },
  ]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const addWorkItem = () => {
    setWorkItems([
      ...workItems,
      {
        name: '',
        description: '',
        quantity: 1,
        unit: 'งาน',
        materialCost: 0,
        laborCost: 0,
        equipmentCost: 0,
      },
    ]);
  };

  const removeWorkItem = (index: number) => {
    setWorkItems(workItems.filter((_, i) => i !== index));
  };

  const updateWorkItem = (index: number, field: string, value: any) => {
    const updated = [...workItems];
    updated[index] = { ...updated[index], [field]: value };
    setWorkItems(updated);
  };

  const analyze = async () => {
    if (!projectName || !budget || workItems.length === 0) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/analyze-tor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName,
          budget: parseFloat(budget),
          workItems,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setAnalysis(data.analysis);
      } else {
        alert('เกิดข้อผิดพลาด: ' + data.error);
      }
    } catch (error) {
      console.error(error);
      alert('ไม่สามารถวิเคราะห์ได้');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('th-TH', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Calculator className="w-12 h-12 text-blue-600" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              วิเคราะห์ TOR และคำนวณกำไร
            </h1>
          </div>
          <p className="text-xl text-gray-600">
            วิเคราะห์ต้นทุน คำนวณกำไร และประเมินความเสี่ยงอัตโนมัติ
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            {/* Project Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-600" />
                ข้อมูลโครงการ
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ชื่อโครงการ
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="เช่น โครงการก่อสร้างอาคาร 5 ชั้น"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    งบประมาณ (บาท)
                  </label>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="50000000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Work Items */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Calculator className="w-6 h-6 text-blue-600" />
                  รายการงาน
                </h2>
                <button
                  onClick={addWorkItem}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  เพิ่มรายการ
                </button>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {workItems.map((item, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <span className="font-semibold text-gray-700">
                        รายการที่ {index + 1}
                      </span>
                      {workItems.length > 1 && (
                        <button
                          onClick={() => removeWorkItem(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateWorkItem(index, 'name', e.target.value)}
                        placeholder="ชื่องาน"
                        className="col-span-2 px-3 py-2 border border-gray-300 rounded text-sm"
                      />

                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateWorkItem(index, 'quantity', parseFloat(e.target.value))}
                        placeholder="จำนวน"
                        className="px-3 py-2 border border-gray-300 rounded text-sm"
                      />

                      <input
                        type="text"
                        value={item.unit}
                        onChange={(e) => updateWorkItem(index, 'unit', e.target.value)}
                        placeholder="หน่วย"
                        className="px-3 py-2 border border-gray-300 rounded text-sm"
                      />

                      <input
                        type="number"
                        value={item.materialCost}
                        onChange={(e) => updateWorkItem(index, 'materialCost', parseFloat(e.target.value))}
                        placeholder="ต้นทุนวัสดุ"
                        className="px-3 py-2 border border-gray-300 rounded text-sm"
                      />

                      <input
                        type="number"
                        value={item.laborCost}
                        onChange={(e) => updateWorkItem(index, 'laborCost', parseFloat(e.target.value))}
                        placeholder="ค่าแรง"
                        className="px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={analyze}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 font-semibold text-lg flex items-center justify-center gap-2"
            >
              <Calculator className="w-5 h-5" />
              {loading ? 'กำลังวิเคราะห์...' : 'วิเคราะห์และคำนวณกำไร'}
            </button>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {analysis ? (
              <>
                {/* Profit Analysis */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                    การวิเคราะห์กำไร
                  </h2>

                  <div className="space-y-4">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="text-sm text-gray-600">งบประมาณ</div>
                        <div className="text-2xl font-bold text-blue-600">
                          {formatCurrency(analysis.profitAnalysis.totalBudget)}
                        </div>
                      </div>

                      <div className="p-4 bg-red-50 rounded-lg">
                        <div className="text-sm text-gray-600">ต้นทุนรวม</div>
                        <div className="text-2xl font-bold text-red-600">
                          {formatCurrency(analysis.profitAnalysis.totalCost)}
                        </div>
                      </div>

                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="text-sm text-gray-600">กำไรสุทธิ</div>
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(analysis.profitAnalysis.netProfit)}
                        </div>
                        <div className="text-sm text-green-600">
                          ({analysis.profitAnalysis.netProfitPercent.toFixed(1)}%)
                        </div>
                      </div>

                      <div className="p-4 bg-purple-50 rounded-lg">
                        <div className="text-sm text-gray-600">ราคาแนะนำ</div>
                        <div className="text-2xl font-bold text-purple-600">
                          {formatCurrency(analysis.profitAnalysis.recommendedBidPrice)}
                        </div>
                        <div className="text-sm text-purple-600">
                          (ลด {analysis.profitAnalysis.recommendedDiscount.toFixed(1)}%)
                        </div>
                      </div>
                    </div>

                    {/* Cost Breakdown */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="font-semibold mb-2">รายละเอียดต้นทุน:</div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>วัสดุ:</span>
                          <span className="font-medium">{formatCurrency(analysis.profitAnalysis.totalMaterialCost)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>ค่าแรง:</span>
                          <span className="font-medium">{formatCurrency(analysis.profitAnalysis.totalLaborCost)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>เครื่องมือ:</span>
                          <span className="font-medium">{formatCurrency(analysis.profitAnalysis.totalEquipmentCost)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>ค่าบริหาร:</span>
                          <span className="font-medium">{formatCurrency(analysis.profitAnalysis.managementCost)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>ภาษี (VAT 7%):</span>
                          <span className="font-medium">{formatCurrency(analysis.profitAnalysis.taxCost)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    คำแนะนำ
                  </h2>

                  <div className="space-y-2">
                    {analysis.recommendations.map((rec: string, index: number) => (
                      <div key={index} className="p-3 bg-blue-50 rounded-lg text-sm">
                        {rec}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Risks */}
                {analysis.risks.length > 0 && (
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-6 h-6 text-yellow-600" />
                      ความเสี่ยง
                    </h2>

                    <div className="space-y-3">
                      {analysis.risks.map((risk: any, index: number) => (
                        <div key={index} className="p-4 border-l-4 border-yellow-500 bg-yellow-50 rounded">
                          <div className="font-semibold text-yellow-900">{risk.category}</div>
                          <div className="text-sm text-yellow-800 mt-1">{risk.description}</div>
                          <div className="text-sm text-yellow-700 mt-2">
                            <strong>แนวทางแก้ไข:</strong> {risk.mitigation}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <Calculator className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  พร้อมวิเคราะห์
                </h3>
                <p className="text-gray-600">
                  กรอกข้อมูลโครงการและรายการงาน<br />
                  จากนั้นคลิก "วิเคราะห์และคำนวณกำไร"
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
