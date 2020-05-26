import React from "react";
import * as PIXI from "pixi.js";
import starfish from "../img/starfish.jpg";
import ripple from "../img/water_displacement_map.jpg";

export default class WaterRipple extends React.Component {
  constructor(props) {
    super(props);
    this.pixi_cnt = null;
    this.app = new PIXI.Application({
      width: 1600,
      height: 600,
    });
  }
  updatePixiCnt = (element) => {
    // the element is the DOM object that we will use as container to add pixi stage(canvas)
    this.pixi_cnt = element;
    //now we are adding the application to the DOM element which we got from the Ref.
    if (this.pixi_cnt && this.pixi_cnt.children.length <= 0) {
      this.pixi_cnt.appendChild(this.app.view);

      var image = new PIXI.Sprite.from(starfish);
      image.width = 1600;
      image.height = 900;
      this.app.stage.addChild(image);

      var displacementSprite = new PIXI.Sprite.from(ripple);
      var displacementFilter = new PIXI.filters.DisplacementFilter(
        displacementSprite
      );
      displacementSprite.texture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;
      this.app.stage.addChild(displacementSprite);
      this.app.stage.filters = [displacementFilter];

      this.app.renderer.view.style.transform = "scale(1.02)";

      displacementSprite.scale.x = 4;
      displacementSprite.scale.y = 4;
      animate();
    }
    function animate() {
      displacementSprite.x += 8;
      displacementSprite.y += 3;
      requestAnimationFrame(animate);
    }
  };

  render() {
    return <div ref={this.updatePixiCnt} />;
  }
}
