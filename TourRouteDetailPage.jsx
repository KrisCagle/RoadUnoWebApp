import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const TermsOfUsePage = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      <Helmet>
        <title>Terms of Use - RoadUno</title>
        <meta name="description" content="Read the Terms and Conditions for RoadUno. By using our services, you agree to these legal terms." />
      </Helmet>
      
      <Navigation />

      <main className="pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto px-4"
        >
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-pink-500 pb-2">
              Terms and Conditions
            </h1>
            <p className="text-slate-400 mt-2">Last updated: August 14, 2025</p>
          </div>

          <div className="prose prose-invert prose-lg max-w-none text-slate-300 space-y-6">
            <h2 className="text-2xl font-bold text-white border-b border-slate-700 pb-2">1. Agreement to Our Legal Terms</h2>
            <p>
              We are RoadUNO (“Company,” “we,” “us,” “our“), a company based in Nashville, Tennessee, USA.
            </p>
            <p>
              We operate the website http://www.roaduno.com (the “Site“), as well as any other related products and services that refer or link to these legal terms (the “Legal Terms“) (collectively, the “Services“). You can contact us by email at kriscagle@roaduno.com.
            </p>
            <p>
              These Legal Terms constitute a legally binding agreement made between you, whether personally or on behalf of an entity (“you“), and RoadUNO, concerning your access to and use of the Services. You agree that by accessing the Services, you have read, understood, and agreed to be bound by all of these Legal Terms. IF YOU DO NOT AGREE WITH ALL OF THESE LEGAL TERMS, THEN YOU ARE EXPRESSLY PROHIBITED FROM USING THE SERVICES AND YOU MUST DISCONTINUE USE IMMEDIATELY.
            </p>
            <p>
              Supplemental terms and conditions or documents that may be posted on the Services from time to time are hereby expressly incorporated herein by reference. We reserve the right, in our sole discretion, to make changes or modifications to these Legal Terms at any time and for any reason. We will alert you about any changes by updating the “Last updated” date of these Legal Terms, and you waive any right to receive specific notice of each such change. It is your responsibility to periodically review these Legal Terms to stay informed of updates. You will be subject to, and will be deemed to have been made aware of and to have accepted, the changes in any revised Legal Terms by your continued use of the Services after the date such revised Legal Terms are posted.
            </p>
            <p>
              The Services are intended for users who are at least 13 years of age. All users who are minors in the jurisdiction in which they reside (generally under the age of 18) must have the permission of, and be directly supervised by, their parent or guardian to use the Services. If you are a minor, you must have your parent or guardian read and agree to these Legal Terms prior to you using the Services.
            </p>

            <h2 className="text-2xl font-bold text-white border-b border-slate-700 pb-2">2. Intellectual Property Rights</h2>
            <p>
              We are the owner or the licensee of all intellectual property rights in our Services, including all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics in the Services (collectively, the “Content”), as well as the trademarks, service marks, and logos contained therein (the “Marks”). Our Content and Marks are protected by copyright and trademark laws and treaties in the United States and around the world. The Content and Marks are provided in or through the Services “AS IS” for your personal, non-commercial use only.
            </p>

            <h2 className="text-2xl font-bold text-white border-b border-slate-700 pb-2">3. User Registration</h2>
            <p>
              You may be required to register to use the Services. You agree to keep your password confidential and will be responsible for all use of your account and password. We reserve the right to remove, reclaim, or change a username you select if we determine, in our sole discretion, that such username is inappropriate, obscene, or otherwise objectionable.
            </p>

            <h2 className="text-2xl font-bold text-white border-b border-slate-700 pb-2">4. Prohibited Activities</h2>
            <p>
              You may not access or use the Services for any purpose other than that for which we make the Services available. The Services may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us. As a user of the Services, you agree not to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Systematically retrieve data or other content from the Services to create or compile, directly or indirectly, a collection, database, or directory without written permission from us.</li>
              <li>Trick, defraud, or mislead us and other users, especially in any attempt to learn sensitive account information such as user passwords.</li>
              <li>Circumvent, disable, or otherwise interfere with security-related features of the Services.</li>
              <li>Disparage, tarnish, or otherwise harm, in our opinion, us and/or the Services.</li>
              <li>Use any information obtained from the Services in order to harass, abuse, or harm another person.</li>
              <li>Engage in any automated use of the system, such as using scripts to send comments or messages, or using any data mining, robots, or similar data gathering and extraction tools.</li>
              <li>Interfere with, disrupt, or create an undue burden on the Services or the networks or services connected to the Services.</li>
              <li>Use the Services as part of any effort to compete with us or use the Services for any revenue-generating endeavor or commercial enterprise.</li>
            </ul>

            <h2 className="text-2xl font-bold text-white border-b border-slate-700 pb-2">5. User Generated Contributions</h2>
            <p>
              The Services may invite you to contribute to or participate in features that allow you to create, submit, and post content (“Contributions”). Any Contributions you transmit may be treated as non-confidential and non-proprietary. You are solely responsible for your Contributions and you expressly agree to exonerate us from any and all responsibility and to refrain from any legal action against us regarding your Contributions.
            </p>

            <h2 className="text-2xl font-bold text-white border-b border-slate-700 pb-2">6. Services Management</h2>
            <p>
              We reserve the right, but not the obligation, to: (1) monitor the Services for violations of these Legal Terms; (2) take appropriate legal action against anyone who violates the law or these Legal Terms; (3) refuse, restrict access to, or disable any of your Contributions; and (4) otherwise manage the Services in a manner designed to protect our rights and property and to facilitate the proper functioning of the Services.
            </p>

            <h2 className="text-2xl font-bold text-white border-b border-slate-700 pb-2">7. Privacy Policy</h2>
            <p>
              We care about data privacy and security. Please review our Privacy Policy at https://roaduno.com/privacy-policy/. By using the Services, you agree to be bound by our Privacy Policy, which is incorporated into these Legal Terms.
            </p>

            <h2 className="text-2xl font-bold text-white border-b border-slate-700 pb-2">8. Term and Termination</h2>
            <p>
              These Legal Terms shall remain in full force and effect while you use the Services. We reserve the right to deny access to and use of the Services to any person for any reason, including for breach of any representation, warranty, or covenant contained in these Legal Terms or of any applicable law or regulation.
            </p>

            <h2 className="text-2xl font-bold text-white border-b border-slate-700 pb-2">9. Governing Law</h2>
            <p>
              These Legal Terms and your use of the Services are governed by and construed in accordance with the laws of the State of Tennessee, USA.
            </p>

            <h2 className="text-2xl font-bold text-white border-b border-slate-700 pb-2">10. Disclaimer</h2>
            <p>
              THE SERVICES ARE PROVIDED ON AN AS-IS AND AS-AVAILABLE BASIS. YOU AGREE THAT YOUR USE OF THE SERVICES WILL BE AT YOUR SOLE RISK. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, IN CONNECTION WITH THE SERVICES AND YOUR USE THEREOF.
            </p>

            <h2 className="text-2xl font-bold text-white border-b border-slate-700 pb-2">11. Limitations of Liability</h2>
            <p>
              IN NO EVENT WILL WE OR OUR DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY DIRECT, INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFIT, LOST REVENUE, LOSS OF DATA, OR OTHER DAMAGES ARISING FROM YOUR USE OF THE SERVICES, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
            </p>

            <h2 className="text-2xl font-bold text-white border-b border-slate-700 pb-2">12. Contact Us</h2>
            <p>
              In order to resolve a complaint regarding the Services or to receive further information regarding use of the Services, please contact us at:
            </p>
            <p>
              RoadUNO<br />
              Nashville, TN, USA<br />
              Email: kriscagle@roaduno.com
            </p>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsOfUsePage;