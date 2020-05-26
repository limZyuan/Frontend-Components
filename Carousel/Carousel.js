export const nextSlide = () => {
  //get all the slides
  const slides = document.querySelectorAll(".slide");
  // Get current class
  const current = document.querySelector(".current");
  if (current) {
    // remove current class
    current.classList.remove("current");
    // check for next slide
    if (
      current.nextElementSibling &&
      current.nextElementSibling.className === "slide"
    ) {
      // add current to next sibling
      current.nextElementSibling.classList.add("current");
    } else {
      // add current to start
      slides[0].classList.add("current");
    }
    setTimeout(() => current.classList.remove("current"));
  }
};
export const prevSlide = () => {
  // get all the slides
  const slides = document.querySelectorAll(".slide");
  // Get current class
  const current = document.querySelector(".current");

  if (current) {
    // remove current class
    current.classList.remove("current");
    // check for prev slide
    if (current.previousElementSibling) {
      // add current to prev sibling
      current.previousElementSibling.classList.add("current");
    } else {
      // add current to last
      slides[slides.length - 1].classList.add("current");
    }
    setTimeout(() => current.classList.remove("current"));
  }
};
