import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Plus, Trash2, Printer, FileText } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

const MerchProfitCalculatorPage = () => {
  const { toast } = useToast();
  const [assumptions, setAssumptions] = useState({
    paymentFeePercent: '3.0',
    venueCutPercent: '0',
    shows: '10',
    avgAttendees: '120',
    buyerRatePercent: '8.0',
  });
  const [items, setItems] = useState([
    { id: 1, checked: false, name: 'Tee Shirt', unitCost: '7.50', price: '25', inventory: '50', sellThrough: '35' },
    { id: 2, checked: false, name: '', unitCost: '', price: '', inventory: '', sellThrough: '' },
  ]);

  const handleAssumptionChange = (e) => {
    const { name, value } = e.target;
    setAssumptions(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (id, field, value) => {
    setItems(prevItems => prevItems.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const addItem = () => {
    setItems(prev => [...prev, { id: Date.now(), checked: false, name: '', unitCost: '', price: '', inventory: '', sellThrough: '' }]);
  };

  const removeCheckedItems = () => {
    setItems(prev => prev.filter(item => !item.checked));
  };
  
  const handlePrint = () => {
     toast({
      title: '🚧 Feature Coming Soon!',
      description: "Printing isn't implemented yet, but you can request it!",
    });
  }

  const calculatedItems = useMemo(() => {
    const buyerRate = parseFloat(assumptions.buyerRatePercent) / 100 || 0;
    const avgAttendees = parseFloat(assumptions.avgAttendees) || 0;
    const potentialBuyers = avgAttendees * buyerRate;

    return items.map(item => {
      if (!item.name) return { ...item, estUnitsSold: 0, grossRevenue: 0, profit: 0 };
      const inventory = parseFloat(item.inventory) || 0;
      const sellThrough = parseFloat(item.sellThrough) / 100 || 0;
      const price = parseFloat(item.price) || 0;
      const unitCost = parseFloat(item.unitCost) || 0;

      const estUnitsSold = Math.min(inventory, inventory * sellThrough);
      const grossRevenue = estUnitsSold * price;
      const totalCost = estUnitsSold * unitCost;
      const profit = grossRevenue - totalCost;

      return { ...item, estUnitsSold, grossRevenue, profit };
    });
  }, [items, assumptions]);

  const totals = useMemo(() => {
    return calculatedItems.reduce((acc, item) => {
      if (!item.name) return acc;
      acc.estUnitsSold += item.estUnitsSold;
      acc.grossRevenue += item.grossRevenue;
      acc.profit += item.profit;
      return acc;
    }, { estUnitsSold: 0, grossRevenue: 0, profit: 0 });
  }, [calculatedItems]);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      <Helmet>
        <title>Merch Profit Calculator - RoadUno</title>
        <meta name="description" content="Forecast your merchandise revenue and profit with RoadUno's free Merch Profit Calculator." />
      </Helmet>
      
      <Navigation />

      <main className="pt-32 pb-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto"
        >
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">Merch <span className="gradient-text">Profit Calculator</span></h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Forecast profit and avoid dead stock. Enter your items and assumptions to estimate units sold, revenue, costs, and profit.
            </p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 md:p-8 space-y-8">
            <div className="mb-8 text-slate-300">
                <p className="mb-4">For most independent artists, smart merch can out-earn the guarantee. Use the field-tested tactics below and the free calculator to forecast profit and avoid dead stock.</p>
                <h2 className="text-xl font-bold mb-2 text-white">What Makes Merch Profitable</h2>
                <ul className="list-disc list-inside space-y-1 mb-4">
                    <li>Design for clarity at 10 feet. Big type and simple graphics often outsell clever details.</li>
                    <li>Price for the room, not the dream. Match local spending power and the bill style.</li>
                    <li>Start with two winners, then expand. One premium tee and one lower priced impulse item often beat five options that confuse buyers.</li>
                    <li>Track unit velocity by show size. Reorder based on what actually moves.</li>
                </ul>
                <h2 className="text-xl font-bold mb-2 text-white">Pricing Framework</h2>
                <p>As a baseline, target a 60 to 70 percent gross margin after venue cut and payment fees. If the venue takes a cut, raise price or steer buyers to items with better margins like hats or posters. Enter your items and assumptions. The table estimates units sold, revenue, costs, and profit.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Object.entries({
                paymentFeePercent: 'Payment fee %',
                venueCutPercent: 'Venue cut %',
                shows: 'Shows on this run',
                avgAttendees: 'Avg attendees/show',
                buyerRatePercent: 'Buyer rate %',
              }).map(([key, label]) => (
                <div key={key} className="space-y-1">
                  <Label htmlFor={key} className="text-sm font-medium text-slate-400">{label}</Label>
                  <Input type="number" id={key} name={key} value={assumptions[key]} onChange={handleAssumptionChange} className="bg-slate-800 border-slate-700 focus:border-pink-500"/>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={addItem}><Plus className="mr-2 h-4 w-4"/> Add Item</Button>
              <Button variant="destructive" onClick={removeCheckedItems}><Trash2 className="mr-2 h-4 w-4"/> Remove Checked</Button>
              <Button variant="outline" onClick={handlePrint}><Printer className="mr-2 h-4 w-4"/> Print or Save as PDF</Button>
              <div className="flex-grow text-right text-sm font-mono text-green-400">Calculator ready</div>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-full text-sm">
                <div className="grid grid-cols-[auto_1fr_repeat(6,minmax(100px,1fr))] gap-4 pb-2 font-semibold text-slate-300 border-b border-slate-700">
                  <div></div>
                  <div className="pl-2">Item</div>
                  <div className="text-right">Unit Cost</div>
                  <div className="text-right">Price</div>
                  <div className="text-right">Inventory</div>
                  <div className="text-right">Sell-through %</div>
                  <div className="text-right">Est Units Sold</div>
                  <div className="text-right">Gross Revenue</div>
                </div>

                {calculatedItems.map(item => (
                  <div key={item.id} className="grid grid-cols-[auto_1fr_repeat(6,minmax(100px,1fr))] gap-4 items-center py-2 border-b border-slate-800">
                    <Checkbox id={`check-${item.id}`} checked={item.checked} onCheckedChange={(checked) => handleItemChange(item.id, 'checked', checked)} className="border-slate-600"/>
                    <Input value={item.name} onChange={e => handleItemChange(item.id, 'name', e.target.value)} className="bg-slate-800 border-slate-700"/>
                    <Input type="number" value={item.unitCost} onChange={e => handleItemChange(item.id, 'unitCost', e.target.value)} className="text-right bg-slate-800 border-slate-700"/>
                    <Input type="number" value={item.price} onChange={e => handleItemChange(item.id, 'price', e.target.value)} className="text-right bg-slate-800 border-slate-700"/>
                    <Input type="number" value={item.inventory} onChange={e => handleItemChange(item.id, 'inventory', e.target.value)} className="text-right bg-slate-800 border-slate-700"/>
                    <Input type="number" value={item.sellThrough} onChange={e => handleItemChange(item.id, 'sellThrough', e.target.value)} className="text-right bg-slate-800 border-slate-700"/>
                    <div className="text-right font-mono">{item.estUnitsSold.toFixed(0)}</div>
                    <div className="text-right font-mono text-green-400">${item.grossRevenue.toFixed(2)}</div>
                  </div>
                ))}
                
                <div className="grid grid-cols-[auto_1fr_repeat(6,minmax(100px,1fr))] gap-4 pt-4 font-bold">
                    <div></div>
                    <div className="pl-2 text-right">Totals</div>
                    <div />
                    <div />
                    <div />
                    <div />
                    <div className="text-right font-mono">{totals.estUnitsSold.toFixed(0)}</div>
                    <div className="text-right font-mono text-green-400">${totals.grossRevenue.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default MerchProfitCalculatorPage;