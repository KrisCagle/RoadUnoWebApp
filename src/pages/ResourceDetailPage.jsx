import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowLeft, Link as LinkIcon } from 'lucide-react';
import { resources } from '@/data/resources';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';

const ResourceDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const resource = resources.find(r => r.slug === slug);

  if (!resource) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <h1 className="text-4xl">Resource not found</h1>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{resource.title} - RoadUno Resources</title>
        <meta name="description" content={resource.description} />
        {resource.keywords && <meta name="keywords" content={resource.keywords} />}
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={resource.title} />
        <meta property="og:description" content={resource.description} />
        {resource.image && <meta property="og:image" content={resource.image} />}

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={resource.title} />
        <meta name="twitter:description" content={resource.description} />
        {resource.image && <meta name="twitter:image" content={resource.image} />}
      </Helmet>

      <div className="min-h-screen bg-slate-950">
        <Navigation />

        <section className="pt-32 pb-20 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Button
                variant="ghost"
                onClick={() => navigate('/resources')}
                className="mb-8 text-orange-400 hover:text-orange-300"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Resources
              </Button>

              <div className="flex items-center gap-4 mb-6">
                <div className="bg-gradient-to-br from-orange-500/20 to-pink-500/20 w-16 h-16 rounded-lg flex items-center justify-center">
                  <resource.icon className="h-8 w-8 text-orange-400" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold">{resource.title}</h1>
                  <p className="text-lg text-slate-400 mt-2">{resource.description}</p>
                </div>
              </div>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-12 mt-12">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="lg:col-span-2 space-y-8 text-lg text-slate-300 leading-relaxed"
              >
                {resource.content.map((section, index) => (
                  <div key={index}>
                    <h2 className="text-3xl font-bold mb-4 text-white border-l-4 border-pink-500 pl-4">
                      {section.heading}
                    </h2>
                    {section.paragraphs && section.paragraphs.map((p, i) => (
                      <p key={i} className="mb-4">{p}</p>
                    ))}
                     {section.list && (
                      <ul className="space-y-2 my-4 list-disc list-inside">
                        {section.list.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    )}
                    {section.paragraphs_after_list && section.paragraphs_after_list.map((p, i) => (
                      <p key={i} className="mt-4">{p}</p>
                    ))}
                    {section.table && (
                      <div className="overflow-x-auto my-6">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr>
                              {section.table.headers.map(header => (
                                <th key={header} className="p-3 bg-slate-800 border-b-2 border-slate-700 font-semibold">{header}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {section.table.rows.map((row, rowIndex) => (
                              <tr key={rowIndex} className="bg-slate-900/50 hover:bg-slate-800/50 transition-colors">
                                {row.map((cell, cellIndex) => (
                                  <td key={cellIndex} className="p-3 border-b border-slate-800">{cell}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {section.links && (
                      <div className="space-y-3 mt-4">
                        {section.links.map((link, linkIndex) => (
                          <a
                            key={linkIndex}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-orange-400 hover:text-orange-300 transition-colors"
                          >
                            <LinkIcon className="h-4 w-4" />
                            <span>{link.text}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="lg:col-span-1"
              >
                <div className="sticky top-32 bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                  <h3 className="text-2xl font-bold mb-4">Checklist</h3>
                  <ul className="space-y-3">
                    {resource.checklist.map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-400 mt-1 flex-shrink-0" />
                        <span className="text-slate-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default ResourceDetailPage;