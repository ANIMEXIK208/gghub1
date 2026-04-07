export default function About() {
  return (
    <main className="min-h-screen bg-[#040504] text-green-100 py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6">
            About <span className="gradient-text">GGHub</span>
          </h1>
          <p className="text-xl text-green-300 leading-relaxed">
            GGHub provides premium gaming accessories with clear service, easy ordering, and simple support.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">Our Mission</h2>
            <p className="text-green-200 leading-relaxed">
              GGHub exists to make premium gaming gear accessible while offering a reliable and professional shopping experience.
            </p>
            <p className="text-green-200 leading-relaxed">
              We provide products and service that make ordering easy and support that helps you move forward with confidence.
            </p>
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">What Makes Us Different</h2>
            <ul className="space-y-4 text-green-200">
              <li className="flex items-start gap-3">
                <span className="text-green-400 text-xl mt-1">🎮</span>
                <span>Interactive challenges with clear progress tracking</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 text-xl mt-1">🏆</span>
                <span>Community challenge progress tracking to help you see achievements.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 text-xl mt-1">👥</span>
                <span>Personalized accounts with profile and purchase history</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 text-xl mt-1">⚡</span>
                <span>Premium accessories selected for quality and reliability</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-900/20 via-black to-green-900/20 rounded-3xl p-8 border border-green-600 mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Our Story</h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="space-y-4">
              <div className="text-4xl">🌟</div>
              <h3 className="text-xl font-semibold text-green-300">The Beginning</h3>
              <p className="text-green-200 text-sm">
                GGHub was created to bring premium gear and reliable service together in one place.
              </p>
            </div>
            <div className="space-y-4">
              <div className="text-4xl">🚀</div>
              <h3 className="text-xl font-semibold text-green-300">Innovation</h3>
              <p className="text-green-200 text-sm">
                We combined curated accessories with simple challenge tools to create a more engaging shopping experience.
              </p>
            </div>
            <div className="space-y-4">
              <div className="text-4xl">🌍</div>
              <h3 className="text-xl font-semibold text-green-300">Community</h3>
              <p className="text-green-200 text-sm">
                GGHub supports gamers who want a reliable, easy-to-use store with good products and clear support.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Join GGHub</h2>
          <p className="text-green-300 mb-8 max-w-2xl mx-auto">
            Shop premium accessories and access clear service without extra steps.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#products"
              className="bg-green-600 text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-green-500 transition-all transform hover:scale-105 shadow-lg"
            >
              Shop Now
            </a>
            <a
              href="/"
              className="border-2 border-green-500 text-green-300 px-8 py-4 rounded-full font-bold text-lg hover:bg-green-500 hover:text-black transition-all transform hover:scale-105"
            >
              Back to Home
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}