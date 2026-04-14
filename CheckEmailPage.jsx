import React, { useState, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Plus, Trash2, Calendar, Save, Calculator } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { GOOGLE_API_KEY } from '@/config/google';

// Utility to parse numeric inputs, handle empty strings and NaNs
const parseNumber = (value) => {
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
};

const TourRoutingPlannerPage = () => {
  const { toast } = useToast();
  const [rows, setRows] = useState([
    {
      id: 1,
      city: '',
      venue: '',
      distance: '0',
      showDate: '',
      estPay: '0',
      fuel: '0',
      lodging: '0',
      otherCosts: '0',
      notes: '',
      selected: false,
    },
  ]);
  const [selectAll, setSelectAll] = useState(false);

  // Calculate rowNet for a single row
  const calculateRowNet = useCallback((row) => {
    return (
      parseNumber(row.estPay) -
      parseNumber(row.fuel) -
      parseNumber(row.lodging) -
      parseNumber(row.otherCosts)
    );
  }, []);

  // Recalculate totals whenever rows change
  const totals = useMemo(() => {
    return rows.reduce(
      (acc, row) => {
        const rowNet = calculateRowNet(row);
        acc.fuel += parseNumber(row.fuel);
        acc.lodging += parseNumber(row.lodging);
        acc.otherCosts += parseNumber(row.otherCosts);
        acc.rowNet += rowNet;
        return acc;
      },
      { fuel: 0, lodging: 0, otherCosts: 0, rowNet: 0 }
    );
  }, [rows, calculateRowNet]);

  const handleInputChange = (id, field, value) => {
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.id === id ? { ...row, [field]: value } : row
      )
    );
  };

  const addRow = () => {
    setRows((prevRows) => [
      ...prevRows,
      {
        id: prevRows.length ? Math.max(...prevRows.map((r) => r.id)) + 1 : 1,
        city: '',
        venue: '',
        distance: '0',
        showDate: '',
        estPay: '0',
        fuel: '0',
        lodging: '0',
        otherCosts: '0',
        notes: '',
        selected: false,
      },
    ]);
  };

  const deleteSelectedRows = () => {
    setRows((prevRows) => prevRows.filter((row) => !row.selected));
    setSelectAll(false);
  };

  const toggleSelectAll = () => {
    setSelectAll((prevSelectAll) => {
      const newSelectAllState = !prevSelectAll;
      setRows((prevRows) =>
        prevRows.map((row) => ({ ...row, selected: newSelectAllState }))
      );
      return newSelectAllState;
    });
  };

  const toggleRowSelect = (id) => {
    setRows((prevRows) => {
      const updatedRows = prevRows.map((row) =>
        row.id === id ? { ...row, selected: !row.selected } : row
      );
      setSelectAll(updatedRows.every((row) => row.selected));
      return updatedRows;
    });
  };

  const handleSaveAsPDF = () => {
    toast({
      title: '🚧 Feature Coming Soon!',
      description: 'PDF export will be available with Pro membership at $10/mo.',
    });
  };

  return (
    <>
      <Helmet>
        <title>Tour Routing Planner - RoadUno Tools</title>
        <meta name="description" content="Plan your tour route to save money and make sense. Interactive tool for indie musicians to track costs and revenue per show." />
      </Helmet>

      <div className="min-h-screen bg-slate-950 text-slate-300">
        <Navigation />

        <main className="pt-32 pb-20 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
                Tour <span className="gradient-text">Routing Planner</span>
              </h1>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                Build a tour route that makes sense and saves money. Plan each stop, calculate costs, and track your net earnings per city.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 mb-12"
            >
              <article className="prose prose-invert max-w-none text-slate-300">
                <h2 className="text-3xl font-bold mb-4 text-white">How to Build a Tour Route That Makes Sense (and Saves Money)</h2>
                <p>Touring is one of the most exciting parts of being a musician, but without a smart plan it can become expensive fast. Poor routing burns fuel, eats into profit, and kills momentum. A well planned route saves money, grows your audience, and keeps you performing at your best. Use the guide below and the interactive chart to plan a route that makes sense for your goals.</p>

                <h3 className="text-2xl font-bold mt-6 mb-2 text-white">1. Start With a Clear Goal</h3>
                <p>Decide what success looks like for this run. Common goals include growing fans in new markets, maximizing income, or building industry relationships. Your goal will shape which cities you target and how far you travel.</p>

                <h3 className="text-2xl font-bold mt-6 mb-2 text-white">2. Use the Anchor Show Method</h3>
                <p>Lock in a few high value anchor shows first. These are strong guarantees, festivals, or markets with proven draw. Then stitch together secondary markets along the path to and from those anchors to reduce wasted miles.</p>

                <h3 className="text-2xl font-bold mt-6 mb-2 text-white">3. Map Smart, Not Just Straight</h3>
                <p>Shortest distance is not always cheapest. City clusters within a 150 to 250 mile radius can outperform a straight line with long gaps. Keep average daily drive times reasonable and consider regional routing to minimize fuel and lodging.</p>

                <h3 className="text-2xl font-bold mt-6 mb-2 text-white">4. Balance Travel Days and Show Days</h3>
                <p>Aim for four hours or less between shows when possible. Use rest or content days strategically for press, video, and networking. Small adjustments improve performance quality and merch sales.</p>

                <h3 className="text-2xl font-bold mt-6 mb-2 text-white">5. Plan For Hidden Costs</h3>
                <p>Budget for tolls, parking, loading zones, fuel, lodging, and food. Build a cushion so surprises do not erase profit from a strong night.</p>

                <h3 className="text-2xl font-bold mt-6 mb-2 text-white">6. How RoadUNO Helps</h3>
                <p>RoadUNO surfaces efficient routes, venue locations with 360 view, local tips, and logistics in one place. Use the chart below to plan now, then graduate to RoadUNO for faster routing and deeper insights.</p>
              </article>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 mb-12"
            >
              <h2 className="text-3xl font-bold mb-6 text-white text-center">Interactive Tour Routing Chart</h2>
              <p className="text-center text-slate-400 mb-8">Fill this out to map your run. Use "Add Row" to build your route.</p>

              <div className="overflow-x-auto">
                <table className="w-full text-left table-auto">
                  <thead>
                    <tr className="bg-slate-700/50">
                      <th className="p-2 border-b border-slate-700 text-sm font-semibold text-slate-200">
                        <Checkbox
                          id="select-all"
                          checked={selectAll}
                          onCheckedChange={toggleSelectAll}
                          className="mr-2 border-slate-500 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                        />
                        <Label htmlFor="select-all">Select All</Label>
                      </th>
                      <th className="p-2 border-b border-slate-700 text-sm font-semibold text-slate-200">City</th>
                      <th className="p-2 border-b border-slate-700 text-sm font-semibold text-slate-200">Venue</th>
                      <th className="p-2 border-b border-slate-700 text-sm font-semibold text-slate-200 w-24">Distance (mi)</th>
                      <th className="p-2 border-b border-slate-700 text-sm font-semibold text-slate-200 w-32">Show Date</th>
                      <th className="p-2 border-b border-slate-700 text-sm font-semibold text-slate-200 w-24">Est Pay ($)</th>
                      <th className="p-2 border-b border-slate-700 text-sm font-semibold text-slate-200 w-24">Fuel ($)</th>
                      <th className="p-2 border-b border-slate-700 text-sm font-semibold text-slate-200 w-24">Lodging ($)</th>
                      <th className="p-2 border-b border-slate-700 text-sm font-semibold text-slate-200 w-24">Other Costs ($)</th>
                      <th className="p-2 border-b border-slate-700 text-sm font-semibold text-slate-200 w-24">Row Net ($)</th>
                      <th className="p-2 border-b border-slate-700 text-sm font-semibold text-slate-200">Notes</th>
                      <th className="p-2 border-b border-slate-700 text-sm font-semibold text-slate-200 w-16"></th> {/* For delete button */}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.id} className="even:bg-slate-800/20 hover:bg-slate-800/40 transition-colors">
                        <td className="p-2 border-b border-slate-700">
                          <Checkbox
                            checked={row.selected}
                            onCheckedChange={() => toggleRowSelect(row.id)}
                            className="border-slate-500 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500"
                          />
                        </td>
                        <td className="p-2 border-b border-slate-700"><Input type="text" value={row.city} onChange={(e) => handleInputChange(row.id, 'city', e.target.value)} placeholder="City" className="bg-slate-900 border-slate-700 w-full" /></td>
                        <td className="p-2 border-b border-slate-700"><Input type="text" value={row.venue} onChange={(e) => handleInputChange(row.id, 'venue', e.target.value)} placeholder="Venue" className="bg-slate-900 border-slate-700 w-full" /></td>
                        <td className="p-2 border-b border-slate-700"><Input type="number" value={row.distance} onChange={(e) => handleInputChange(row.id, 'distance', e.target.value)} placeholder="0" className="bg-slate-900 border-slate-700 w-full" /></td>
                        <td className="p-2 border-b border-slate-700">
                          <div className="relative flex items-center">
                            <Input type="date" value={row.showDate} onChange={(e) => handleInputChange(row.id, 'showDate', e.target.value)} placeholder="mm/dd/yyyy" className="bg-slate-900 border-slate-700 w-full pr-8" />
                            <Calendar className="absolute right-2 h-4 w-4 text-slate-400 pointer-events-none" />
                          </div>
                        </td>
                        <td className="p-2 border-b border-slate-700"><Input type="number" value={row.estPay} onChange={(e) => handleInputChange(row.id, 'estPay', e.target.value)} placeholder="0" className="bg-slate-900 border-slate-700 w-full" /></td>
                        <td className="p-2 border-b border-slate-700"><Input type="number" value={row.fuel} onChange={(e) => handleInputChange(row.id, 'fuel', e.target.value)} placeholder="0" className="bg-slate-900 border-slate-700 w-full" /></td>
                        <td className="p-2 border-b border-slate-700"><Input type="number" value={row.lodging} onChange={(e) => handleInputChange(row.id, 'lodging', e.target.value)} placeholder="0" className="bg-slate-900 border-slate-700 w-full" /></td>
                        <td className="p-2 border-b border-slate-700"><Input type="number" value={row.otherCosts} onChange={(e) => handleInputChange(row.id, 'otherCosts', e.target.value)} placeholder="0" className="bg-slate-900 border-slate-700 w-full" /></td>
                        <td className="p-2 border-b border-slate-700 font-bold text-white">${calculateRowNet(row).toFixed(2)}</td>
                        <td className="p-2 border-b border-slate-700"><Input type="text" value={row.notes} onChange={(e) => handleInputChange(row.id, 'notes', e.target.value)} placeholder="Notes" className="bg-slate-900 border-slate-700 w-full" /></td>
                        <td className="p-2 border-b border-slate-700">
                          <Button variant="ghost" size="icon" onClick={() => setRows(rows.filter(r => r.id !== row.id))} className="text-red-500 hover:text-red-400">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-slate-700/50 font-bold text-white">
                      <td className="p-2" colSpan="5">Totals</td>
                      <td className="p-2"></td> {/* Est Pay total not specified in image */}
                      <td className="p-2">${totals.fuel.toFixed(2)}</td>
                      <td className="p-2">${totals.lodging.toFixed(2)}</td>
                      <td className="p-2">${totals.otherCosts.toFixed(2)}</td>
                      <td className="p-2">${totals.rowNet.toFixed(2)}</td>
                      <td className="p-2" colSpan="2"></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center mt-6">
                <div className="flex gap-2">
                  <Button onClick={addRow} className="bg-orange-500 hover:bg-orange-600 text-white">
                    <Plus className="h-4 w-4 mr-2" /> Add Row
                  </Button>
                  <Button
                    onClick={deleteSelectedRows}
                    disabled={rows.filter(row => row.selected).length === 0}
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Delete Selected
                  </Button>
                </div>
                <Button onClick={handleSaveAsPDF} variant="outline" className="border-slate-700 hover:border-pink-500">
                  <Save className="h-4 w-4 mr-2" /> Save as PDF (Pro)
                </Button>
              </div>
              <p className="text-xs text-slate-400 mt-4 text-center">
                Tip: Row Net equals Est Pay minus Fuel, Lodging, and Other Costs. Totals recalculate automatically.
              </p>
            </motion.div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default TourRoutingPlannerPage;