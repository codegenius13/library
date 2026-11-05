import React, { useEffect, useState } from "react";
import { FaArrowUp } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import "./MoveTop.css";

const MoveTop = () => {

  const [showButton, setShowButton] = useState(false);

  useEffect(() => {

    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowButton(true);
      } else {
        setShowButton(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);

  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (

    <AnimatePresence>

      {showButton && (

        <motion.button
          className="move-top"
          onClick={scrollToTop}

          initial={{ opacity: 0, y: 80, scale: 0.7 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 80, scale: 0.7 }}

          transition={{
            duration: 0.35,
            ease: "easeOut"
          }}

          whileHover={{
            scale: 1.12
          }}

          whileTap={{
            scale: 0.95
          }}
        >

          <span className="bubble bubble1"></span>
          <span className="bubble bubble2"></span>
          <span className="bubble bubble3"></span>
          <span className="bubble bubble4"></span>

          <FaArrowUp />

        </motion.button>

      )}

    </AnimatePresence>

  );
};

export default MoveTop;