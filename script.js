let currentSong = new Audio();
let songs;
let currFolder;
function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00"; // Return "00:00" if the seconds are invalid
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}
async function getsongs(folder) {
  currFolder = folder;
  let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
  let resp = await a.text();
  let div = document.createElement("div");
  div.innerHTML = resp;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`${folder}/`)[1]);
    }
  }
  let songUl = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  songUl.innerHTML = "";
  for (const song of songs) {
    songUl.innerHTML += `<li> 
                <img class="invert" src="music.svg" alt="" />
                <div class="info">
                  <div>${song.replaceAll("%20", " ")}</div>
                  <div>vidhu</div>
                </div>
                <div class="playnow">
                  <span>play now</span>
                  <img class="invert" src="play.svg" alt="" />
                </div>
        </li>`;
  }
  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      console.log(e.querySelector(".info").firstElementChild.innerHTML);
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });
  return songs;
}
const playMusic = (track, pau = false) => {
  currentSong.src = `/${currFolder}/` + track;
  if (!pau) {
    currentSong.play();
    pla.src = "pause.svg";
  }

  document.querySelector(".songInfo").innerHTML = decodeURI(track);
  document.querySelector(".songItem").innerHTML = "00:00 / 00:00";
};
//display function
async function displayAlbums() {
  let a = await fetch(`http://127.0.0.1:3000/songs/`);
  let resp = await a.text();
  let div = document.createElement("div");
  div.innerHTML = resp;
  let anc = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cards-container");
  let arr = Array.from(anc);
  for (let index = 0; index < arr.length; index++) {
    const e = arr[index];
    if (e.href.includes("/songs")) {
      let folder = e.href.split("/").slice(-2)[0];
      //get the metadata
      let a = await fetch(`http://127.0.0.1:3000//songs/${folder}/inf.json`);
      let resp = await a.json();
      console.log(resp);
      cardContainer.innerHTML += `<div data-folder="${folder}" class="card">
              <img src="/songs/${folder}/cover.jpg" alt=""/>
              <div class="circle play">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 37.75 37.75"
                  id="PlayButton"
                >
                  <circle
                    cx="18.88"
                    cy="18.88"
                    r="18"
                    fill="#0fc60f"
                    stroke="#0fc60f"
                    stroke-miterlimit="10"
                    stroke-width="1.75"
                    class="colorStroke000000 svgStroke"
                  ></circle>
                  <path
                    d="M12.14 18.88V8.79l8.74 5.05 8.73 5.04-8.73 5.03-8.74 5.04V18.88z"
                    fill="#010b0f"
                    class="color000000 svgShape"
                  ></path>
                </svg>
              </div>
              <h2>${resp.title}</h2>
              <p>${resp.description}</p>
            </div>`;
    }
  }
  //albums
  Array.from(document.getElementsByClassName("card")).forEach((er) => {
    er.addEventListener("click", async (item) => {
      songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0]);
    });
  });
}
async function main() {
  await getsongs("songs/hindi");
  console.log(songs);
  playMusic(songs[0], true);
  var audio = new Audio(songs[0]);
  displayAlbums();
  // audio.play()

  //playbar
  pla.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      pla.src = "pause.svg";
    } else {
      currentSong.pause();
      pla.src = "play.svg";
    }
  });
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songItem").innerHTML = `${formatTime(
      currentSong.currentTime
    )}
        /${formatTime(currentSong.duration)}`;
    document.querySelector(".cir").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let per = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".cir").style.left = per + "%";
    currentSong.currentTime = (currentSong.duration * per) / 100;
  });
  // Update song duration once metadata is loaded
  currentSong.addEventListener("loadedmetadata", () => {
    document.querySelector(".songItem").innerHTML = `00:00 / ${formatTime(
      currentSong.duration
    )}`; // Update duration once metadata is loaded
  });
  //hamburger
  document.querySelector(".ham").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });
  //close
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });
  let prev = document.querySelector("#prev");
  let next = document.querySelector("#next");
  // Add an event listener to previous
  prev.addEventListener("click", () => {
    currentSong.pause();
    console.log("Previous clicked");
    console.log(currentSong.src.split("/").slice(-1)[0]);
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });

  // Add an event listener to next
  next.addEventListener("click", () => {
    currentSong.pause();
    console.log("Next clicked");
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });
  //voluume
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      currentSong.volume = parseInt(e.target.value) / 100;
    });
  //mute
  document.querySelector(".vol>img").addEventListener("click", (e) => {
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("volume.svg", "mute.svg");
      currentSong.volume = 0;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 0;
    } else {
      e.target.src = e.target.src.replace("mute.svg", "volume.svg");
      currentSong.volume = 0.1;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 10;
    }
  });
  // Automatically play the next song when the current song ends
  currentSong.addEventListener("ended", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    } else {
      // Optionally, loop back to the first song
      playMusic(songs[0]);
    }
  });
}

main();
