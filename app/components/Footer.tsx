export default function Footer() {
    return (
      <footer className="bg-gray-800 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between">
            <div>
              <h3 className="text-lg font-bold mb-2">WanderWise</h3>
              <p>Discover your next adventure</p>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-2">Quick Links</h4>
              <ul>
                <li>About Us</li>
                <li>Contact</li>
                <li>Terms of Service</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 text-center">
            <p>&copy; 2023 WanderWise. All rights reserved.</p>
          </div>
        </div>
      </footer>
    )
  }
  
  