
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-cyan-900 relative overflow-hidden">
            {/* PC-98 style grid background */}
            <div className="absolute inset-0 opacity-10">
                <div className="h-full w-full" style={{
                    backgroundImage: `
            linear-gradient(rgba(0,255,255,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,255,0.3) 1px, transparent 1px)
          `,
                    backgroundSize: '20px 20px'
                }}></div>
            </div>

            {/* Glowing border effect */}
            <div className="absolute inset-4 border-2 border-cyan-400 rounded-lg opacity-60 shadow-[0_0_20px_rgba(0,255,255,0.5)]"></div>

            <div className="relative z-10 flex items-center justify-center min-h-screen px-6">
                <div className="max-w-5xl mx-auto text-center">

                    {/* Retro terminal header */}
                    <div className="bg-black border-2 border-cyan-400 rounded-lg p-2 mb-8 font-mono text-sm shadow-[0_0_15px_rgba(0,255,255,0.3)]">
                        <div className="bg-cyan-400 text-black px-2 py-1 rounded mb-2">
                            CODELEARN.SYS v2.1 - PROGRAMMING EDUCATION SYSTEM
                        </div>
                        <div className="text-cyan-400">
                            C:\&gt; INITIALIZE LEARNING_PROTOCOL
                        </div>
                    </div>

                    <h1 className="text-7xl font-bold mb-6 font-mono tracking-wider">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-400 to-yellow-400 drop-shadow-[0_0_10px_rgba(0,255,255,0.7)]">
              CODE_LEARN
            </span>
                    </h1>

                    <div className="bg-black border border-cyan-400 rounded-lg p-6 mb-8 font-mono text-cyan-300 shadow-[0_0_15px_rgba(0,255,255,0.2)]">
                        <div className="text-lg mb-4 text-yellow-300">
                            &gt; MASTER PROGRAMMING LANGUAGES WITH AI GUIDANCE
                        </div>
                        <div className="text-base">
                            Learn Python, JavaScript, C++, Java & more through interactive challenges.<br/>
                            Your personal AI mentor adapts to your learning style and pace.
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                        <Link href="/signup">
                            <Button
                                size="lg"
                                className="w-full sm:w-auto bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 border-2 border-cyan-400 text-black font-mono font-bold text-lg px-8 py-3 shadow-[0_0_10px_rgba(0,255,255,0.5)] hover:shadow-[0_0_15px_rgba(0,255,255,0.7)] transition-all"
                            >
                                START_LEARNING.EXE
                            </Button>
                        </Link>
                        <Link href="/login">
                            <Button
                                variant="outline"
                                size="lg"
                                className="w-full sm:w-auto border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black font-mono font-bold text-lg px-8 py-3 bg-transparent shadow-[0_0_10px_rgba(0,255,255,0.3)] hover:shadow-[0_0_15px_rgba(0,255,255,0.7)] transition-all"
                            >
                                LOGIN.BAT
                            </Button>
                        </Link>
                    </div>

                    {/* PC-98 style feature windows */}
                    <div className="grid md:grid-cols-3 gap-6 mt-16">
                        <div className="bg-black border-2 border-cyan-400 rounded-lg p-6 font-mono shadow-[0_0_10px_rgba(0,255,255,0.3)]">
                            <div className="bg-cyan-400 text-black px-2 py-1 rounded text-sm mb-4 font-bold">
                                ASSESSMENT.DLL
                            </div>
                            <div className="text-6xl mb-4 text-yellow-400">⚡</div>
                            <h3 className="font-bold text-lg mb-2 text-cyan-300">Skill Detection</h3>
                            <p className="text-gray-300 text-sm">Advanced algorithms determine your programming level across multiple languages</p>
                        </div>

                        <div className="bg-black border-2 border-pink-400 rounded-lg p-6 font-mono shadow-[0_0_10px_rgba(255,20,147,0.3)]">
                            <div className="bg-pink-400 text-black px-2 py-1 rounded text-sm mb-4 font-bold">
                                AI_MENTOR.EXE
                            </div>
                            <div className="text-6xl mb-4 text-pink-400">🤖</div>
                            <h3 className="font-bold text-lg mb-2 text-pink-300">AI Companion</h3>
                            <p className="text-gray-300 text-sm">Customizable digital mentor with adaptive teaching personalities</p>
                        </div>

                        <div className="bg-black border-2 border-yellow-400 rounded-lg p-6 font-mono shadow-[0_0_10px_rgba(255,255,0,0.3)]">
                            <div className="bg-yellow-400 text-black px-2 py-1 rounded text-sm mb-4 font-bold">
                                PROGRESS.SYS
                            </div>
                            <div className="text-6xl mb-4 text-yellow-400">📊</div>
                            <h3 className="font-bold text-lg mb-2 text-yellow-300">Multi-Language Path</h3>
                            <p className="text-gray-300 text-sm">Progress from basics to advanced across Python, JS, C++, Java & more</p>
                        </div>
                    </div>

                    {/* Language support section */}
                    <div className="mt-16 bg-black border-2 border-purple-400 rounded-lg p-6 font-mono shadow-[0_0_15px_rgba(128,0,128,0.3)]">
                        <div className="bg-purple-400 text-black px-3 py-2 rounded mb-4 font-bold">
                            SUPPORTED_LANGUAGES.CFG
                        </div>
                        <div className="text-purple-300 mb-4">
                            &gt; Currently Available: <span className="text-cyan-400 font-bold">Python</span>
                        </div>
                        <div className="text-gray-400 text-sm">
                            &gt; Coming Soon: JavaScript • C++ • Java • Go • Rust • TypeScript
                        </div>
                        <div className="text-yellow-400 text-xs mt-2">
                            * Additional languages loaded via future system updates
                        </div>
                    </div>

                </div>
            </div>

            {/* Animated scan lines */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="h-full w-full opacity-20" style={{
                    backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0,255,255,0.1) 2px,
            rgba(0,255,255,0.1) 4px
          )`
                }}></div>
            </div>
        </div>
    );
}