import { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Set the top scroll behavior
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="p-3 bg-[#CE6A24] text-white rounded-full shadow-lg hover:bg-[#B1561E] transition-all transform hover:-translate-y-1 active:scale-95 animate-in fade-in slide-in-from-bottom-4 duration-300"
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-6 h-6 stroke-[3px]" />
        </button>
      )}
    </div>
  );
};

export default ScrollToTop;
