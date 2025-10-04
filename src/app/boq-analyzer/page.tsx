'use client';

import { useState } from 'react';
import { Calculator, Plus, Trash2, FileText, Package, Users, Wrench, TrendingUp, Clock } from 'lucide-react';

export default function BOQAnalyzerPage() {
  const [projectName, setProjectName] = useState('');
  const [budget, setBudget] = useState('');
  const [items, setItems] = useState<any[]>([
    { no: '1', description: '', unit: 'ตร.ม.', quantity: 0 },
  ]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'materials' | 'labor' | 'equipment'>('summary');

  const addItem = () => {
    setItems([...items, { 
      no: `${items.length + 1}`, 
      description: '', 
      unit: 'ตร.ม.', 
      quantity: 0 
    }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const analyze = async () => {
    if (!projectName || !budget || items.length === 0) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/analyze-boq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName,
          totalBudget: parseFloat(budget),
          items,
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

  const loadExample = () => {
    setProjectName('โครงการก่อสร้างอาคารสำนักงาน 3 ชั้น');
    setBudget('15000000');
    setItems([
      { no: '1', description: 'งานเทคอนกรีตพื้น', unit: 'ตร.ม.', quantity: 150 },
      { no: '2', description: 'งานก่ออิฐผนัง', unit: 'ตร.ม.', quantity: 300 },
      { no: '3', description: 'งานติดตั้งไฟฟ้า', unit: 'จุด', quantity: 80 },
      { no: '4', description: 'งานทาสีภายใน', unit: 'ตร.ม.', quantity: 500 },
      { no: '5', description: 'งานติดตั้งประตู-หน้าต่าง', unit: 'ชุด', quantity: 25 },
    ]);
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('th-TH', { minimumFractionDigits: 0 });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FileText className="w-12 h-12 text-emerald-600" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              วิเคราะห์ BOQ
            </h1>
          </div>
          <p className="text-xl text-gray-600">
            ถอดรายการวัสดุ-อุปกรณ์-แรงงาน อัตโนมัติจาก BOQ
          </p>
          <button
            onClick={loadExample}
            className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            โหลดตัวอย่าง
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            {/* Project Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4">ข้อมูลโครงการ</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ชื่อโครงการ
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="โครงการก่อสร้างอาคาร..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    งบประมาณรวม (บาท)
                  </label>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="15000000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* BOQ Items */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">รายการ BOQ</h2>
                <button
                  onClick={addItem}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  เพิ่มรายการ
                </button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {items.map((item, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <span className="font-semibold text-gray-700">
                        {item.no}. รายการ
                      </span>
                      {items.length > 1 && (
                        <button
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-2">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        placeholder="รายการงาน เช่น งานเทคอนกรีตพื้น"
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                      
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                          placeholder="จำนวน"
                          className="px-3 py-2 border border-gray-300 rounded text-sm"
                        />
                        <select
                          value={item.unit}
                          onChange={(e) => updateItem(index, 'unit', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded text-sm col-span-2"
                        >
                          <option value="ตร.ม.">ตร.ม.</option>
                          <option value="ลบ.ม.">ลบ.ม.</option>
                          <option value="จุด">จุด</option>
                          <option value="ชุด">ชุด</option>
                          <option value="งาน">งาน</option>
                          <option value="เมตร">เมตร</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={analyze}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 font-semibold text-lg flex items-center justify-center gap-2"
            >
              <Calculator className="w-5 h-5" />
              {loading ? 'กำลังวิเคราะห์...' : 'วิเคราะห์ BOQ และถอดรายการ'}
            </button>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {analysis ? (
              <>
                {/* Summary Card */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-emerald-600" />
                    สรุปผลการวิเคราะห์
                  </h2>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="text-sm text-gray-600">งบประมาณ</div>
                      <div className="text-2xl font-bold text-blue-600">
                        {formatCurrency(analysis.totalBudget)}
                      </div>
                    </div>

                    <div className="p-4 bg-red-50 rounded-lg">
                      <div className="text-sm text-gray-600">ต้นทุนรวม</div>
                      <div className="text-2xl font-bold text-red-600">
                        {formatCurrency(analysis.summary.totalCost)}
                      </div>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="text-sm text-gray-600">กำไรสุทธิ</div>
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(analysis.summary.profit)}
                      </div>
                      <div className="text-sm text-green-600">
                        ({analysis.summary.profitPercent.toFixed(1)}%)
                      </div>
                    </div>

                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="text-sm text-gray-600">รายการทั้งหมด</div>
                      <div className="text-2xl font-bold text-purple-600">
                        {analysis.summary.totalItems}
                      </div>
                    </div>
                  </div>

                  {/* Cost Breakdown */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between p-2 bg-gray-50 rounded">
                      <span>💰 วัสดุ:</span>
                      <span className="font-semibold">{formatCurrency(analysis.summary.totalMaterialCost)}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-gray-50 rounded">
                      <span>👷 แรงงาน:</span>
                      <span className="font-semibold">{formatCurrency(analysis.summary.totalLaborCost)}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-gray-50 rounded">
                      <span>🔧 เครื่องมือ:</span>
                      <span className="font-semibold">{formatCurrency(analysis.summary.totalEquipmentCost)}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-gray-50 rounded">
                      <span>📋 ค่าบริหาร (7%):</span>
                      <span className="font-semibold">{formatCurrency(analysis.summary.managementCost)}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-gray-50 rounded">
                      <span>💳 ภาษี VAT (7%):</span>
                      <span className="font-semibold">{formatCurrency(analysis.summary.taxCost)}</span>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="flex border-b border-gray-200">
                    <button
                      onClick={() => setActiveTab('summary')}
                      className={`flex-1 px-4 py-3 font-medium flex items-center justify-center gap-2 ${
                        activeTab === 'summary'
                          ? 'bg-emerald-50 text-emerald-600 border-b-2 border-emerald-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <TrendingUp className="w-4 h-4" />
                      สรุป
                    </button>
                    <button
                      onClick={() => setActiveTab('materials')}
                      className={`flex-1 px-4 py-3 font-medium flex items-center justify-center gap-2 ${
                        activeTab === 'materials'
                          ? 'bg-emerald-50 text-emerald-600 border-b-2 border-emerald-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Package className="w-4 h-4" />
                      วัสดุ ({analysis.materialSummary?.length || 0})
                    </button>
                    <button
                      onClick={() => setActiveTab('labor')}
                      className={`flex-1 px-4 py-3 font-medium flex items-center justify-center gap-2 ${
                        activeTab === 'labor'
                          ? 'bg-emerald-50 text-emerald-600 border-b-2 border-emerald-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      แรงงาน ({analysis.laborSummary?.length || 0})
                    </button>
                    <button
                      onClick={() => setActiveTab('equipment')}
                      className={`flex-1 px-4 py-3 font-medium flex items-center justify-center gap-2 ${
                        activeTab === 'equipment'
                          ? 'bg-emerald-50 text-emerald-600 border-b-2 border-emerald-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Wrench className="w-4 h-4" />
                      เครื่องมือ ({analysis.equipmentSummary?.length || 0})
                    </button>
                  </div>

                  <div className="p-6 max-h-96 overflow-y-auto">
                    {/* Summary Tab */}
                    {activeTab === 'summary' && (
                      <div className="space-y-4">
                        {analysis.items.map((item: any, index: number) => (
                          <div key={index} className="p-4 border border-gray-200 rounded-lg">
                            <div className="font-semibold text-gray-900 mb-2">
                              {item.no}. {item.description}
                            </div>
                            <div className="text-sm text-gray-600 mb-2">
                              {item.quantity} {item.unit}
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div className="p-2 bg-blue-50 rounded">
                                <div className="text-gray-600">วัสดุ</div>
                                <div className="font-semibold">{formatCurrency(item.materialTotal)}</div>
                              </div>
                              <div className="p-2 bg-green-50 rounded">
                                <div className="text-gray-600">แรงงาน</div>
                                <div className="font-semibold">{formatCurrency(item.laborTotal)}</div>
                              </div>
                              <div className="p-2 bg-purple-50 rounded">
                                <div className="text-gray-600">เครื่องมือ</div>
                                <div className="font-semibold">{formatCurrency(item.equipmentTotal)}</div>
                              </div>
                            </div>
                            <div className="mt-2 pt-2 border-t border-gray-200 text-sm font-semibold">
                              รวม: {formatCurrency(item.totalPrice)} บาท
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Materials Tab */}
                    {activeTab === 'materials' && (
                      <div className="space-y-3">
                        {analysis.materialSummary?.map((material: any, index: number) => (
                          <div key={index} className="p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <div className="font-semibold text-gray-900">{material.name}</div>
                                <div className="text-xs text-gray-500">{material.specification}</div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-emerald-600">
                                  {formatCurrency(material.totalPrice)}
                                </div>
                                <div className="text-xs text-gray-500">บาท</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">จำนวน:</span>{' '}
                                <span className="font-medium">{material.totalQuantity.toFixed(2)} {material.unit}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">ราคา/หน่วย:</span>{' '}
                                <span className="font-medium">{formatCurrency(material.unitPrice)}</span>
                              </div>
                            </div>
                            <div className="mt-2 text-xs text-gray-500">
                              ใช้ในรายการ: {material.usedInItems.join(', ')}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Labor Tab */}
                    {activeTab === 'labor' && (
                      <div className="space-y-3">
                        {analysis.laborSummary?.map((labor: any, index: number) => (
                          <div key={index} className="p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <div className="font-semibold text-gray-900">{labor.type}</div>
                                <div className="text-xs text-gray-500">
                                  {labor.skill === 'foreman' && '🔷 หัวหน้างาน'}
                                  {labor.skill === 'skilled' && '⭐ ช่างฝีมือ'}
                                  {labor.skill === 'helper' && '👷 ผู้ช่วย'}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-green-600">
                                  {formatCurrency(labor.totalCost)}
                                </div>
                                <div className="text-xs text-gray-500">บาท</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">วันคน:</span>{' '}
                                <span className="font-medium">{labor.totalManDays.toFixed(1)} วัน</span>
                              </div>
                              <div>
                                <span className="text-gray-600">ค่าจ้าง/วัน:</span>{' '}
                                <span className="font-medium">{formatCurrency(labor.dailyRate)}</span>
                              </div>
                            </div>
                            <div className="mt-2 text-xs text-gray-500">
                              ใช้ในรายการ: {labor.usedInItems.join(', ')}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Equipment Tab */}
                    {activeTab === 'equipment' && (
                      <div className="space-y-3">
                        {analysis.equipmentSummary?.map((equipment: any, index: number) => (
                          <div key={index} className="p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <div className="font-semibold text-gray-900">{equipment.name}</div>
                                <div className="text-xs text-gray-500">
                                  {equipment.type === 'owned' ? '🏠 เป็นของเรา' : '🔄 เช่า'}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-purple-600">
                                  {formatCurrency(equipment.totalCost)}
                                </div>
                                <div className="text-xs text-gray-500">บาท</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">ใช้งาน:</span>{' '}
                                <span className="font-medium">{equipment.totalUsageDays.toFixed(1)} วัน</span>
                              </div>
                              {equipment.dailyRate > 0 && (
                                <div>
                                  <span className="text-gray-600">ค่าเช่า/วัน:</span>{' '}
                                  <span className="font-medium">{formatCurrency(equipment.dailyRate)}</span>
                                </div>
                              )}
                            </div>
                            <div className="mt-2 text-xs text-gray-500">
                              ใช้ในรายการ: {equipment.usedInItems.join(', ')}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Timeline */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Clock className="w-6 h-6 text-blue-600" />
                    Timeline
                  </h2>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">ระยะเวลาโครงการ</div>
                    <div className="text-3xl font-bold text-blue-600">
                      {analysis.timeline.totalDuration} วัน
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  พร้อมวิเคราะห์ BOQ
                </h3>
                <p className="text-gray-600">
                  กรอกข้อมูลโครงการและรายการ BOQ<br />
                  หรือคลิก "โหลดตัวอย่าง" เพื่อดูการทำงาน
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
