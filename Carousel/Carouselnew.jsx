import React from "react";
import "./Carousel.css";
import Icon from "@material-ui/core/Icon";
import { nextSlide, prevSlide } from "./Carousel";

let slideInterval;
const intervalTime = 10000;
const auto = false;
var isAnimating = false;

if (auto) {
  // run next slide at interval time
  slideInterval = setInterval(nextSlide, intervalTime);
}

export default class Carouselnew extends React.Component {
  render() {
    const nextButton = () => {
      // used to prevent spam clicks
      if (isAnimating) {
        return;
      }
      isAnimating = true;

      nextSlide();
      // auto sliding
      if (auto) {
        clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, intervalTime);
      }
      // interval allowed for spam clicking
      setTimeout(function () {
        isAnimating = false;
      }, 1000);
    };
    const prevButton = () => {
      if (isAnimating) {
        return;
      }
      isAnimating = true;

      prevSlide();
      if (auto) {
        clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, intervalTime);
      }
      setTimeout(function () {
        isAnimating = false;
      }, 1000);
    };
    return (
      <React.Fragment>
        <div className="slider">
          <div className="slide current">
            <div className="content">
              <h1>Slide One</h1>
              <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Iste
                facilis harum magni officiis consectetur accusantium laudantium
                inventore magnam perferendis animi, hic in tempore reiciendis a
                ut! Libero rerum sed voluptate?
              </p>
            </div>
          </div>
          <div className="slide">
            <div className="content">
              <h1>Slide Two</h1>
              <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Iste
                facilis harum magni officiis consectetur accusantium laudantium
                inventore magnam perferendis animi, hic in tempore reiciendis a
                ut! Libero rerum sed voluptate?
              </p>
            </div>
          </div>
          <div className="slide">
            <div className="content">
              <h1>Slide Three</h1>
              <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Iste
                facilis harum magni officiis consectetur accusantium laudantium
                inventore magnam perferendis animi, hic in tempore reiciendis a
                ut! Libero rerum sed voluptate?
              </p>
            </div>
          </div>
          <div className="slide">
            <div className="content">
              <h1>Slide Four</h1>
              <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Iste
                facilis harum magni officiis consectetur accusantium laudantium
                inventore magnam perferendis animi, hic in tempore reiciendis a
                ut! Libero rerum sed voluptate?
              </p>
            </div>
          </div>
          <div className="slide">
            <div className="content">
              <h1>Slide Five</h1>
              <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Iste
                facilis harum magni officiis consectetur accusantium laudantium
                inventore magnam perferendis animi, hic in tempore reiciendis a
                ut! Libero rerum sed voluptate?
              </p>
            </div>
          </div>
          <div className="slide">
            <div className="content">
              <h1>Slide Six</h1>
              <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Iste
                facilis harum magni officiis consectetur accusantium laudantium
                inventore magnam perferendis animi, hic in tempore reiciendis a
                ut! Libero rerum sed voluptate?
              </p>
            </div>
          </div>
          <button id="prev" onClick={prevButton}>
            <Icon className="fa fa-arrow-left"></Icon>
          </button>
          <button id="next" onClick={nextButton}>
            <Icon className="fa fa-arrow-right"></Icon>
          </button>
        </div>
      </React.Fragment>
    );
  }
}
