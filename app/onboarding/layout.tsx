export default function OnboardingLayout({
                                             children,
                                         }: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="container mx-auto">
                {children}
            </div>
        </div>
    );
}