export const Story = {
  update: (
    elements,
    event,
    config,
    map,
    setLayerOpacity,
    date
  ) => {
    // console.log("update story event: ", event.target.className);

    const clockElement = document.querySelector(".hud__clock");

    // console.log(clockElement)

    const currentChapterElement = elements.find((child) =>
      child.classList.contains("active")
    );
    const currentChapterObject = config.chapters.find(
      (chap) => chap.id === currentChapterElement.id
    );

    const findCurrentObject = (obj) => obj.id === currentChapterElement.id;

    let currInd = config.chapters.findIndex(findCurrentObject);

    let nextChapter;

    if (event.target.className === "story__next-btn") {


      nextChapter = config.chapters[++currInd];

      Story.updateProgression(
        config.chapters,
        nextChapter
      );

      console.log(nextChapter);
        
      if(typeof nextChapter === "undefined") {
        console.log('no next chapter available')

        const middle = config.chapters[Math.round((config.chapters.length - 1) / 2)];

        console.log(middle)
        
        fetch(`https://api.mapbox.com/styles/v1/countnick/ckoa0w5zy1t3j18qkn25xwu6i/static/${middle.location.center[0]},${middle.location.center[1]},10,0,0/600x600?access_token=pk.eyJ1IjoiY291bnRuaWNrIiwiYSI6ImNrbHV6dTVpZDJibXgyd3FtenRtcThwYjYifQ.W_GWvRe3kX14Ef4oT50bSw`)
            .then(res => res.blob())
            .then(blob => {
                const img = URL.createObjectURL(blob)
                console.log(img)

                const shareRoutePage = document.createElement('div')

                shareRoutePage.classList.add('sharePage__container')

                shareRoutePage.insertAdjacentHTML('beforeend', `
                <h1>My journey for water</h1>
                <img src=${img} alt="myroute">
                
                <ul>
                    <li>Today I walked _____ kilometers to get water.</li>
                    <li>On the road I got attacked by__.</li>
                    <li>The route cost me ___ hours to get back home.</li>
                </ul>
                <h2>Because of this I couldn't go to school</h2>
                `)
                
                document.querySelector('body').appendChild(shareRoutePage)
            })
      }

      if (nextChapter.id === "arrival") {
        document.querySelector(".marker").style.display = "block";
      } else {
        document.querySelector(".marker").style.display = "none";
      }

      if (nextChapter.time) {
        console.log("add time: ", nextChapter.time);
        date.setMinutes(date.getMinutes() + nextChapter.time);

        clockElement.textContent = date.toLocaleTimeString();
      }

      const nextChapterElement = elements.find(
        (child) => child.id === nextChapter.id
      );

      currentChapterElement.classList.remove("active");
      // currentChapterElement.classList.add('eraseFromDom')

      currentChapterElement.classList.add("eraseFromDom");
      nextChapterElement.classList.remove("eraseFromDom");
      const setActive = setTimeout(() => {
        nextChapterElement.classList.add("active");
      }, 1);
      if (currentChapterObject.onChapterExit.length > 0) {
        currentChapterObject.onChapterExit.forEach(setLayerOpacity);
      }

      map.flyTo(nextChapter.location);

      if (nextChapter.onChapterEnter.length > 0) {
        nextChapter.onChapterEnter.forEach(setLayerOpacity);
      } else {
        // console.log(e)
      }

      if (nextChapter.hudVisibility) {
        // console.log("make hud vsible");
        document.querySelector(".hud__container").classList.add("active");
      } else if (
        !nextChapter.hudVisibility &&
        document.querySelector(".hud__container").classList.contains("active")
      ) {
        document.querySelector(".hud__container").classList.remove("active");
      }
    } else if (event.target.className === "story__prev-btn") {


      nextChapter = config.chapters[--currInd];

      Story.updateProgression(
        config.chapters,
        nextChapter
      );

      if (nextChapter.id === "arrival") {
        document.querySelector(".marker").style.display = "block";
      } else {
        document.querySelector(".marker").style.display = "none";
      }

      if (currentChapterObject.time) {
        console.log("minus time: ", currentChapterObject.time);
        date.setMinutes(date.getMinutes() - currentChapterObject.time);

        clockElement.textContent = date.toLocaleTimeString();
      }

      const nextChapterElement = elements.find(
        (child) => child.id === nextChapter.id
      );

      currentChapterElement.classList.remove("active");

      currentChapterElement.classList.add("eraseFromDom");
      nextChapterElement.classList.remove("eraseFromDom");
      const setActive = setTimeout(() => {
        nextChapterElement.classList.add("active");
      }, 1);
      if (currentChapterObject.onChapterExit.length > 0) {
        let turnOfLayerList = [];

        currentChapterObject.onChapterExit.forEach((chap) => {
          if (chap.opacity > 0) {
            const turnOfLayer = {
              layer: chap.layer,
              opacity: 0,
            };

            setLayerOpacity(turnOfLayer);
            turnOfLayerList.push(turnOfLayer);
          }
        });

        turnOfLayerList.forEach(setLayerOpacity);
      }

      map.flyTo(nextChapter.location);

      if (nextChapter.onChapterEnter.length > 0) {
        nextChapter.onChapterEnter.forEach(setLayerOpacity);
      } else {
        console.log(e);
      }

      if (nextChapter.hudVisibility) {
        // console.log("make hud vsible");
        document.querySelector(".hud__container").classList.add("active");
      } else if (
        !nextChapter.hudVisibility &&
        document.querySelector(".hud__container").classList.contains("active")
      ) {
        document.querySelector(".hud__container").classList.remove("active");
      }
    }
  },
  createDomElements: (config, features) => {
    config.chapters.forEach((record, idx) => {
      /* These first two variables will hold each vignette, the chapter
          element will go in the container element */
      const container = document.createElement("div");
      const chapter = document.createElement("div");

      const randomEventOne =
        config.randomEvents[
          Math.floor(Math.random() * config.randomEvents.length)
        ];
      const randomSourceEvent =
        config.randomSourceEvents[
          Math.floor(Math.random() * config.randomSourceEvents.length)
        ];
      // console.log('random source event: ', config.chapters[config.chapters.length - 4])
      if (idx === 5) {
        record.id = randomEventOne.id;
        record.title = randomEventOne.title;
        record.description = randomEventOne.description;
      } else if (idx === config.chapters.length - 4) {
        record.id = randomSourceEvent.id;
        record.title = randomSourceEvent.title;
        record.description = randomSourceEvent.description;
      }

      // Creates the title for the vignettes
      if (record.title) {
        const title = document.createElement("h2");
        title.innerText = record.title;
        chapter.appendChild(title);
      }
      // Creates the image for the vignette
      if (record.image) {
        const image = new Image();
        image.src = record.image;
        image.classList.add("destination__img");
        chapter.appendChild(image);
      }
      // Creates the image credit for the vignette
      if (record.imageCredit) {
        const imageCredit = document.createElement("p");
        imageCredit.classList.add("imageCredit");
        imageCredit.innerHTML = `Image credit: ${record.imageCredit}`;
        chapter.appendChild(imageCredit);
      }
      // Creates the description for the vignette
      if (record.description) {
        const story = document.createElement("p");
        story.innerHTML = record.description;
        chapter.appendChild(story);
      }
      // Sets the id for the vignette and adds the step css attribute
      container.setAttribute("id", record.id);
      container.classList.add("step");
      if (idx === 0) {
        container.classList.add("active");
      } else {
        container.classList.add("eraseFromDom");
      }
      // Sets the overall theme to the chapter element
      chapter.classList.add(config.theme);
      /* Appends the chapter to the container element and the container
          element to the features element */
      container.appendChild(chapter);
      features.appendChild(container);
    });
  },
  updateProgression: (chapters, currentChapter) => {
    const progressElement = document.querySelector(".story__progression");
    console.log("chapters: ", chapters.length);
    console.log("current chapter: ", currentChapter);

    if(typeof currentChapter !== 'undefined') {
        chapters.find((chapter, ind) => {
            if (chapter.id === currentChapter.id) {
              const addedByOne = ind + 1;
              progressElement.value = (100 / chapters.length) * addedByOne;
            }
          });
    }



    console.log("percentage: ", 100 / chapters.length);
  },
};
