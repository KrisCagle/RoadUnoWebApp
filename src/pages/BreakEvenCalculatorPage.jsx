import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { RefreshCcw } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const initialFormState = {
  ticketPrice: '15',
  paidAttendance: '120',
  compedTickets: '10',
  payoutMode: 'guarantee-split',
  guarantee: '300',
  artistSplit: '80',
  venueProcessingFee: '0',
  avgMerchPerAttendee: '12',
  venueMerchRate: '20',
  milesDriven: '300',
  vehicleMpg: '12',
  gasPrice: '3.50',
  nightsInHotel: '1',
  lodgingPerNight: '120',
  perDiem: '50',
};

const CalculatorCard = ({ title, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-4"
  >
    <h3 className="text-2xl font-bold mb-4 text-white">{title}</h3>
    {children}
  </motion.div>
);

const ResultChip = ({ label, value }) => (
    <div className="bg-slate-800/60 p-4 rounded-lg text-center shadow-md flex flex-col justify-center">
        <span className="text-sm text-slate-400 uppercase font-semibold tracking-wider">{label}</span>
        <span className="text-2xl font-bold text-white mt-1">{value}</span>
    </div>
);


const BreakEvenCalculatorPage = () => {
  const [form, setForm] = useState(initialFormState);
  const [results, setResults] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const parse = (value) => parseFloat(value) || 0;

  const calculateResults = () => {
    const ticketPrice = parse(form.ticketPrice);
    const paidAttendance = parse(form.paidAttendance);
    const guarantee = parse(form.guarantee);
    const artistSplit = parse(form.artistSplit);
    const venueProcessingFee = parse(form.venueProcessingFee);
    const avgMerchPerAttendee = parse(form.avgMerchPerAttendee);
    const venueMerchRate = parse(form.venueMerchRate);
    const milesDriven = parse(form.milesDriven);
    const vehicleMpg = parse(form.vehicleMpg);
    const gasPrice = parse(form.gasPrice);
    const nightsInHotel = parse(form.nightsInHotel);
    const lodgingPerNight = parse(form.lodgingPerNight);
    const perDiem = parse(form.perDiem);

    // Ticket Revenue
    const doorGross = ticketPrice * paidAttendance;
    const splitAmount = doorGross * (1 - venueProcessingFee / 100) * (artistSplit / 100);
    
    let artistShowGross;
    if (form.payoutMode === 'guarantee') {
        artistShowGross = guarantee;
    } else if (form.payoutMode === 'split') {
        artistShowGross = splitAmount;
    } else { // guarantee-split
        artistShowGross = Math.max(guarantee, splitAmount);
    }
    
    // Merch Revenue
    const totalMerchSales = paidAttendance * avgMerchPerAttendee;
    const merchNet = totalMerchSales * (1 - venueMerchRate / 100);
    
    // Costs
    const gasCost = vehicleMpg > 0 ? (milesDriven / vehicleMpg) * gasPrice : 0;
    const lodgingCost = nightsInHotel * lodgingPerNight;
    const perDiemCost = perDiem * (nightsInHotel + 1); // Assuming per diem for travel day + show day
    const dailyCosts = gasCost + lodgingCost + perDiemCost;

    // Net
    const estimatedNet = artistShowGross + merchNet - dailyCosts;

    setResults({
        doorGross: doorGross.toFixed(2),
        artistShowGross: artistShowGross.toFixed(2),
        merchNet: merchNet.toFixed(2),
        dailyCosts: dailyCosts.toFixed(2),
        estimatedNet: estimatedNet.toFixed(2),
    });
  };
  
  const handleReset = () => {
    setForm(initialFormState);
    setResults(null);
  };

  return (
    <>
      <Helmet>
        <title>Break Even Calculator - RoadUno Tools</title>
        <meta name="description" content="Calculate your show's profitability. Factor in ticket sales, guarantees, merch cuts, and travel costs to make smarter booking decisions." />
      </Helmet>

      <div className="min-h-screen bg-slate-950 text-slate-300">
        <Navigation />
        
        <main className="pt-32 pb-20 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
                Show <span className="gradient-text">Break Even</span> Calculator
              </h1>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                Estimate your potential profit or loss for a single show. Fill in the fields to see your estimated net.
              </p>
            </motion.div>

            <div className="space-y-8">
              <CalculatorCard title="Ticket Revenue">
                <div className="grid md:grid-cols-2 gap-4">
                  <div><Label htmlFor="ticketPrice">Ticket price ($)</Label><Input id="ticketPrice" name="ticketPrice" value={form.ticketPrice} onChange={handleInputChange} type="number" placeholder="e.g. 15" /></div>
                  <div><Label htmlFor="paidAttendance">Paid attendance (est.)</Label><Input id="paidAttendance" name="paidAttendance" value={form.paidAttendance} onChange={handleInputChange} type="number" placeholder="e.g. 120" /></div>
                  <div><Label htmlFor="compedTickets">Comped tickets</Label><Input id="compedTickets" name="compedTickets" value={form.compedTickets} onChange={handleInputChange} type="number" placeholder="e.g. 10" /></div>
                  <div><Label>Payout mode</Label>
                    <Select name="payoutMode" value={form.payoutMode} onValueChange={(value) => handleSelectChange('payoutMode', value)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="guarantee-split">Guarantee vs. split (higher)</SelectItem>
                            <SelectItem value="guarantee">Guarantee only</SelectItem>
                            <SelectItem value="split">Split only</SelectItem>
                        </SelectContent>
                    </Select>
                  </div>
                  <div><Label htmlFor="guarantee">Guarantee ($)</Label><Input id="guarantee" name="guarantee" value={form.guarantee} onChange={handleInputChange} type="number" placeholder="e.g. 300" /></div>
                  <div><Label htmlFor="artistSplit">Artist split (%)</Label><Input id="artistSplit" name="artistSplit" value={form.artistSplit} onChange={handleInputChange} type="number" placeholder="e.g. 80" /></div>
                  <div className="md:col-span-2"><Label htmlFor="venueProcessingFee">Venue/processing fee on door (%)</Label><Input id="venueProcessingFee" name="venueProcessingFee" value={form.venueProcessingFee} onChange={handleInputChange} type="number" placeholder="e.g. 0" /></div>
                </div>
                <p className="text-xs text-slate-400 pt-2">Door gross = ticketPrice × paidAttendance. Comps are excluded from door gross.</p>
              </CalculatorCard>

              <CalculatorCard title="Merch">
                 <div className="grid md:grid-cols-2 gap-4">
                    <div><Label htmlFor="avgMerchPerAttendee">Avg. merch per paid attendee ($)</Label><Input id="avgMerchPerAttendee" name="avgMerchPerAttendee" value={form.avgMerchPerAttendee} onChange={handleInputChange} type="number" placeholder="e.g. 12" /></div>
                    <div><Label htmlFor="venueMerchRate">Venue merch rate (%)</Label><Input id="venueMerchRate" name="venueMerchRate" value={form.venueMerchRate} onChange={handleInputChange} type="number" placeholder="e.g. 20" /></div>
                 </div>
              </CalculatorCard>
              
              <CalculatorCard title="Travel & Daily Costs">
                <div className="grid md:grid-cols-3 gap-4">
                    <div><Label htmlFor="milesDriven">Miles driven per day</Label><Input id="milesDriven" name="milesDriven" value={form.milesDriven} onChange={handleInputChange} type="number" placeholder="e.g. 300" /></div>
                    <div><Label htmlFor="vehicleMpg">Vehicle mpg</Label><Input id="vehicleMpg" name="vehicleMpg" value={form.vehicleMpg} onChange={handleInputChange} type="number" placeholder="e.g. 12" /></div>
                    <div><Label htmlFor="gasPrice">Gas price ($/gal)</Label><Input id="gasPrice" name="gasPrice" value={form.gasPrice} onChange={handleInputChange} type="number" step="0.01" placeholder="e.g. 3.50" /></div>
                    <div><Label htmlFor="nightsInHotel">Nights in hotel</Label><Input id="nightsInHotel" name="nightsInHotel" value={form.nightsInHotel} onChange={handleInputChange} type="number" placeholder="e.g. 1" /></div>
                    <div><Label htmlFor="lodgingPerNight">Lodging per night ($)</Label><Input id="lodgingPerNight" name="lodgingPerNight" value={form.lodgingPerNight} onChange={handleInputChange} type="number" placeholder="e.g. 120" /></div>
                    <div><Label htmlFor="perDiem">Per diem / day ($)</Label><Input id="perDiem" name="perDiem" value={form.perDiem} onChange={handleInputChange} type="number" placeholder="e.g. 50" /></div>
                </div>
              </CalculatorCard>
              
              <div className="flex gap-4 items-center">
                <Button onClick={calculateResults} size="lg" className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white flex-grow">Calculate</Button>
                <Button onClick={handleReset} variant="outline" className="border-slate-600 hover:border-pink-500"><RefreshCcw className="h-4 w-4 mr-2" /> Reset</Button>
              </div>

             {results && (
                 <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8"
                 >
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <ResultChip label="Door Gross" value={`$${results.doorGross}`} />
                        <ResultChip label="Artist Show $" value={`$${results.artistShowGross}`} />
                        <ResultChip label="Merch Net" value={`$${results.merchNet}`} />
                        <ResultChip label="Daily Costs" value={`-$${results.dailyCosts}`} />
                        <ResultChip
                          label="Estimated Net"
                          value={`${parse(results.estimatedNet) < 0 ? '-' : ''}$${Math.abs(results.estimatedNet).toFixed(2)}`}
                        />
                    </div>
                </motion.div>
             )}

            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default BreakEvenCalculatorPage;