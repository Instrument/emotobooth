/* global document, setTimeout */

'use strict';

export default class Threeup {
  constructor(imgPath = null) {
    this.threeup = null;
    this.hero = null;
    this.wrap = null;
    this.imgPath = imgPath;

    this.init();
  }

  init() {
  }

  manifest() {
    const wrap = document.createElement('div');
    wrap.classList.add('threeup-wrap');

    const threeupElt = document.createElement('div');
    threeupElt.classList.add('threeup');
    this.threeup = threeupElt;

    const heroElt = document.createElement('div');
    heroElt.classList.add('threeup-hero');
    this.hero = heroElt;

    wrap.appendChild(this.threeup);
    wrap.appendChild(this.hero);

    this.wrap = wrap;

    document.getElementById('historical').appendChild(wrap);

    this.newImage();
  }

  newImage(imageUrl = this.imgPath, skip = false) {
    this.imgPath = imageUrl;

    this.threeup.style.backgroundImage = `url(${ imageUrl })`;

    if (!skip) {
      this.newHero(imageUrl);
    }
  }

  noMoreHeroes() {
    if (this.hero) {
      this.wrap.removeChild(this.hero);
      this.hero = null;
    }
  }

  newHero(imageUrl = this.imgPath) {
    this.noMoreHeroes();

    const heroElt = document.createElement('hero');
    heroElt.classList.add('threeup-hero');
    this.hero = heroElt;

    this.wrap.appendChild(this.hero);

    this.hero.classList.add('threeup-hero-active');
    this.hero.style.backgroundImage = `url(${ imageUrl })`;

    setTimeout(() => {
      if (this.hero) {
        this.hero.classList.remove('threeup-hero-active');
        setTimeout(() => {
          this.noMoreHeroes();
        }, 2 * 1000);
      }
    }, 3 * 1000);


  }
}
