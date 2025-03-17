import { useEffect, useState } from "react";
import { FaChevronUp } from "react-icons/fa";

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show or hide the button based on the scroll position
  const toggleVisibility = () => {
    if (window.scrollY > window.innerHeight - 100) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Scroll to the top when the button is clicked
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  return (
    <div>
      {isVisible && (
        <div
          onClick={scrollToTop}
          className="bg-lime-500 px-3 py-3 rounded-xl fixed bottom-10 right-10 cursor-pointer transition-opacity duration-300"
        >
          <FaChevronUp />
        </div>
      )}
    </div>
  );
};

export default ScrollToTop;
