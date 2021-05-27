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

    if (event.target.className === "story__next-btn" || event.target.classList.contains("story__next-icon")) {

        
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
        
      }

      if (nextChapter.id === "arrival") {
        document.querySelector(".marker").style.display = "block";
      } else {
        document.querySelector(".marker").style.display = "none";
      }

      if (nextChapter.time) {
        console.log("add time: ", nextChapter.time);
        date.setMinutes(date.getMinutes() + nextChapter.time);

        document.querySelector('.ending__time').textContent = date.toLocaleTimeString()

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

      if(nextChapter.explain) {
          document.querySelector(".explanation__container").classList.remove('eraseFromDom')
      } else {
        document.querySelector(".explanation__container").classList.add('eraseFromDom')
      }

    } else if (event.target.className === "story__prev-btn" || event.target.classList.contains("story__prev-icon")) {


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

      if(nextChapter.explain) {
        document.querySelector(".explanation__container").classList.remove('eraseFromDom')
    } else {
      document.querySelector(".explanation__container").classList.add('eraseFromDom')
    }

    }

    const youAreHereMarker = document.querySelector(".position__marker")

    setTimeout(() => {
        if(document.querySelector("#your-home").classList.contains("active")) {
            console.log('position marker should fade in')
            youAreHereMarker.style.setProperty("opacity", 1, "important")
        } else {
            console.log('position marker should fade out: ', youAreHereMarker)
            youAreHereMarker.style.setProperty("opacity", 0, "important")
        }
    },1)



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
    //   console.log('idx: ', idx, 'id: ', record.id)
      if (record.id === "half") {
        record.id = randomEventOne.id;
        record.title = randomEventOne.title;
        record.description = randomEventOne.description;
      } else if (record.id === "random") {
        record.id = randomSourceEvent.id;
        record.title = randomSourceEvent.title;
        record.description = randomSourceEvent.description;
      }

      // Creates the title for the vignettes
      if (record.title) {
        const title = document.createElement("h2");
        title.classList.add(record.id)
        title.innerText = record.title;


        if(record.icon) {
            title.insertAdjacentHTML('afterbegin', record.icon)  
        }

          
    
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
