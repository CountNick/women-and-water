export const Story = {
  update: (elements, event, config, map, setLayerOpacity) => {
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

      console.log(nextChapter);

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
};
