
export default function AssistantSetupPage() {
    return (
        <div className="max-w-4xl mx-auto py-12 px-6">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    Choose Your AI Learning Companion
                </h1>
                <p className="text-lg text-gray-600">
                    Select the personality that will help you learn best
                </p>
            </div>

            {/* Assistant selection will go here */}
            <div className="grid md:grid-cols-3 gap-6">
                {/* Nice personality */}
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                    <div className="text-4xl mb-4">😊</div>
                    <h3 className="font-semibold text-lg mb-2">Encouraging</h3>
                    <p className="text-gray-600">Supportive and patient, celebrates your wins</p>
                </div>

                {/* Neutral personality */}
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                    <div className="text-4xl mb-4">🤖</div>
                    <h3 className="font-semibold text-lg mb-2">Focused</h3>
                    <p className="text-gray-600">Direct and efficient, keeps you on track</p>
                </div>

                {/* Stern personality */}
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                    <div className="text-4xl mb-4">💪</div>
                    <h3 className="font-semibold text-lg mb-2">Challenging</h3>
                    <p className="text-gray-600">Pushes you harder, expects excellence</p>
                </div>
            </div>
        </div>
    );
}