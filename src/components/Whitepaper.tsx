// import React from 'react';

// const Whitepaper: React.FC = () => {
//   return (
//     <div className="max-w-4xl mx-auto px-6 mb-12">
//       <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg p-8 border border-[#9945FF] shadow-lg transform hover:scale-[1.01] transition-transform">
//         <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-[#9945FF] to-[#14F195] text-transparent bg-clip-text animate-pulse">
//           much whitepaper. very $DNERO. wow.
//         </h1>
        
//         <div className="space-y-8">
//           {/* Abstract */}
//           <section>
//             <h2 className="text-2xl font-bold mb-4 text-[#14F195] flex items-center">
//               <span>such abstract</span>
//               <span className="ml-2">🚀</span>
//             </h2>
//             <p className="text-gray-300 leading-relaxed">
//               fren, let me tell u about $DNERO. much utility. very innovation. wow. 
//               we make meme coins great again with <span className="text-[#14F195]">The Sol Store</span>. 
//               buy merch with $DNERO or $SOL (but $DNERO is cooler). 
//               community strong together! 💎🙌
//             </p>
//           </section>

//           {/* Introduction */}
//           <section>
//             <h2 className="text-2xl font-bold mb-4 text-[#14F195] flex items-center">
//               <span>very introduction</span>
//               <span className="ml-2">📝</span>
//             </h2>
//             <div className="space-y-4">
//               <div>
//                 <h3 className="text-xl font-semibold mb-2 text-[#9945FF] flex items-center">
//                   <span>such problem</span>
//                   <span className="ml-2">😢</span>
//                 </h3>
//                 <p className="text-gray-300">
//                   many meme coins. no use. much sad. only pump and dump. not cool fren.
//                 </p>
//               </div>
//               <div>
//                 <h3 className="text-xl font-semibold mb-2 text-[#9945FF] flex items-center">
//                   <span>much solution</span>
//                   <span className="ml-2">🎉</span>
//                 </h3>
//                 <p className="text-gray-300">
//                   $DNERO fix! buy cool stuff at <span className="text-[#14F195]">The Sol Store</span>. 
//                   meme coin + real use = moon! 🌕
//                 </p>
//               </div>
//             </div>
//           </section>

//           {/* The Sol Store */}
//           <section>
//             <h2 className="text-2xl font-bold mb-4 text-[#14F195] flex items-center">
//               <span>wow store</span>
//               <span className="ml-2">🏪</span>
//             </h2>
//             <p className="text-gray-300 mb-4">
//               much merch. very blockchain. such decentralized. wow.
//               t-shirts, mugs, caps - all the cool stuff for cool frens!
//             </p>
            
//             <h3 className="text-xl font-semibold mb-3 text-[#9945FF] flex items-center">
//               <span>such payments</span>
//               <span className="ml-2">💸</span>
//             </h3>
//             <div className="grid md:grid-cols-2 gap-4">
//               <div className="bg-gray-800/50 p-4 rounded-lg border border-[#9945FF] transform hover:scale-105 transition-transform">
//                 <h4 className="font-bold mb-2 text-[#14F195] flex items-center">
//                   <span>pay with $SOL</span>
//                   <span className="ml-2">⚡</span>
//                 </h4>
//                 <ul className="list-disc list-inside text-gray-300 space-y-2">
//                   <li>7% fee (much expensive)</li>
//                   <li>we buy $DNERO (such smart)</li>
//                 </ul>
//               </div>
//               <div className="bg-gray-800/50 p-4 rounded-lg border border-[#9945FF] transform hover:scale-105 transition-transform">
//                 <h4 className="font-bold mb-2 text-[#14F195] flex items-center">
//                   <span>pay with $DNERO</span>
//                   <span className="ml-2">🌟</span>
//                 </h4>
//                 <ul className="list-disc list-inside text-gray-300 space-y-2">
//                   <li>$3 fee only (very cheap)</li>
//                   <li>free money for hodlers (wow)</li>
//                 </ul>
//               </div>
//             </div>
//           </section>

//           {/* Call to Action */}
//           <section className="text-center">
//             <div className="bg-gradient-to-r from-[#9945FF] to-[#14F195] p-[1px] rounded-lg">
//               <div className="bg-gray-900 p-6 rounded-lg">
//                 <h2 className="text-2xl font-bold mb-3 text-white flex items-center justify-center">
//                   <span>join the $DNERO fam</span>
//                   <span className="ml-2">🚀</span>
//                 </h2>
//                 <p className="text-gray-300 mb-4">to the moon! not financial advice (but actually is) 😉</p>
//                 <button className="bg-[#14F195] text-black px-8 py-3 rounded-lg font-bold hover:bg-[#9945FF] hover:text-white transition-colors transform hover:scale-105">
//                   wen $DNERO? now $DNERO! 🌕
//                 </button>
//               </div>
//             </div>
//           </section>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Whitepaper;

import { FC } from 'react';
import { Sparkles, Rocket, Flame, CreditCard, BarChart3, Users } from 'lucide-react';
import '../styles/whitepaper.css';


const Whitepaper: FC = () => {
 return (
   <div className="w-full bg-black rounded-lg p-6">
     {/* Title */}
     <div className="text-center mb-12 space-y-4">
       <h1 className="text-6xl font-bold bg-gradient-to-r from-[#9945FF] via-[#14F195] to-[#9945FF] text-transparent bg-clip-text animate-gradient">
         🤑 Dinero ($DNERO) 🤑
       </h1>
       <p className="text-2xl text-gray-400">Not your average meme coin ser!</p>
     </div>


     {/* Fun Stats */}
     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
       <div className="bg-gradient-to-br from-purple-600/20 to-green-500/20 p-6 rounded-lg text-center transform hover:scale-105 transition-transform">
         <Flame className="w-12 h-12 mx-auto mb-4 text-[#14F195]" />
         <h3 className="text-2xl font-bold text-[#14F195]">7% SOL Tax</h3>
         <p className="text-gray-400">Gets converted to $DNERO 🔥</p>
       </div>
       <div className="bg-gradient-to-br from-purple-600/20 to-green-500/20 p-6 rounded-lg text-center transform hover:scale-105 transition-transform">
         <Rocket className="w-12 h-12 mx-auto mb-4 text-[#9945FF]" />
         <h3 className="text-2xl font-bold text-[#9945FF]">Moon Mission</h3>
         <p className="text-gray-400">We're going up only! 🚀</p>
       </div>
       <div className="bg-gradient-to-br from-purple-600/20 to-green-500/20 p-6 rounded-lg text-center transform hover:scale-105 transition-transform">
         <Sparkles className="w-12 h-12 mx-auto mb-4 text-[#14F195]" />
         <h3 className="text-2xl font-bold text-[#14F195]">$3 DNERO Fee</h3>
         <p className="text-gray-400">Cheap af compared to SOL! ✨</p>
       </div>
     </div>


     {/* Main Features */}
     <div className="space-y-8 mb-12">
       <div className="bg-gradient-to-br from-purple-600/10 to-green-500/10 p-6 rounded-lg">
         <h2 className="text-4xl font-bold mb-6 flex items-center gap-4">
           <CreditCard className="text-[#9945FF]" />
           <span className="bg-gradient-to-r from-[#9945FF] to-[#14F195] text-transparent bg-clip-text">
             The Sol Store: Buy Stuff with Memes!
           </span>
         </h2>
         <p className="text-xl text-gray-300 leading-relaxed">
           Imagine buying merch with meme coins... Well, stop imagining fren!
           We made it real! 🛍️ Buy shirts, mugs, and more with $DNERO or $SOL
           (but $DNERO is cheaper just saying 😉)
         </p>
       </div>


       <div className="bg-gradient-to-br from-purple-600/10 to-green-500/10 p-6 rounded-lg">
         <h2 className="text-4xl font-bold mb-6 flex items-center gap-4">
           <BarChart3 className="text-[#14F195]" />
           <span className="bg-gradient-to-r from-[#9945FF] to-[#14F195] text-transparent bg-clip-text">
             Tokenomics that Actually Make Sense
           </span>
         </h2>
         <div className="grid md:grid-cols-2 gap-6">
           <div className="space-y-4">
             <h3 className="text-2xl font-bold text-[#9945FF]">Pay with SOL:</h3>
             <ul className="text-xl text-gray-300 space-y-2">
               <li>• 7% tax (we're not sorry) 😎</li>
               <li>• Gets converted to $DNERO 🔄</li>
               <li>• Makes number go up 📈</li>
             </ul>
           </div>
           <div className="space-y-4">
             <h3 className="text-2xl font-bold text-[#14F195]">Pay with $DNERO:</h3>
             <ul className="text-xl text-gray-300 space-y-2">
               <li>• Just $3 fee (bargain!) 🤑</li>
               <li>• Goes to airdrops 🪂</li>
               <li>• Community wins! 🏆</li>
             </ul>
           </div>
         </div>
       </div>


       <div className="bg-gradient-to-br from-purple-600/10 to-green-500/10 p-6 rounded-lg">
         <h2 className="text-4xl font-bold mb-6 flex items-center gap-4">
           <Users className="text-[#9945FF]" />
           <span className="bg-gradient-to-r from-[#9945FF] to-[#14F195] text-transparent bg-clip-text">
             Community Perks
           </span>
         </h2>
         <div className="grid md:grid-cols-3 gap-6 text-center">
           <div>
             <h3 className="text-2xl font-bold text-[#14F195] mb-4">Airdrops</h3>
             <p className="text-gray-300">Free money ser! 💸</p>
           </div>
           <div>
             <h3 className="text-2xl font-bold text-[#14F195] mb-4">Voting</h3>
             <p className="text-gray-300">Democracy or something 🗳️</p>
           </div>
           <div>
             <h3 className="text-2xl font-bold text-[#14F195] mb-4">Memes</h3>
             <p className="text-gray-300">Dankest ones only 🎭</p>
           </div>
         </div>
       </div>
     </div>


     {/* Call to Action */}
     <div className="text-center space-y-6">
       <h2 className="text-4xl font-bold bg-gradient-to-r from-[#9945FF] to-[#14F195] text-transparent bg-clip-text">
         Ready to Join the $DNERO Fam? 🚀
       </h2>
       <p className="text-2xl text-gray-300">
         Don't be that guy who missed out on the next big thing! 😤
       </p>
       <div className="inline-block bg-gradient-to-r from-[#9945FF] to-[#14F195] p-[2px] rounded-lg">
         <button className="px-12 py-4 bg-black rounded-lg hover:bg-gray-900 transition-colors text-xl font-bold">
           Ape In Now! 🦍
         </button>
       </div>
     </div>
   </div>
 );
};


export default Whitepaper;

