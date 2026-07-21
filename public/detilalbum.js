const urlParams = new URLSearchParams(window.location.search);

const albumName = urlParams.get("name");

const artistName = urlParams.get("artist");

let currentTracks = [];

async function loadAlbumDetail(){

    const albumTitle=document.getElementById("albumName");

    const albumArtist=document.getElementById("albumArtist");

    const albumInfo=document.getElementById("albumInfo");

    const albumCover=document.getElementById("albumCover");

    const trackList=document.getElementById("trackList");

    if(!albumName||!artistName){

        albumTitle.innerText="Album tidak ditemukan";

        return;

    }

    try{

        const res=await fetch(`/album-details?artist=${encodeURIComponent(artistName)}&album=${encodeURIComponent(albumName)}`);

        if(!res.ok){

            throw new Error("Gagal mengambil data");

        }

        const data=await res.json();

        currentTracks=data.tracks;

        albumTitle.innerText=data.name;

        albumArtist.innerText=data.artist;

        albumInfo.innerText=`${data.tracks.length} Tracks • ${Number(data.listeners).toLocaleString()} Listeners`;

        albumCover.src=data.image||"https://ui-avatars.com/api/?name=Album";

        if(data.tracks.length===0){

            trackList.innerHTML="<p>Tidak ada track.</p>";

            return;

        }

        trackList.innerHTML=data.tracks.map((track,index)=>`

        <div class="track-row">

            <div class="track-number">

                ${index+1}

            </div>

            <div class="track-info">

                <strong>${track.name}</strong>

            </div>

            <button
                class="add-btn"
                onclick="addSong('${track.name.replace(/'/g,"\\\\'")}')">

                +

            </button>

        </div>

        `).join("");

    }

    catch(err){

        console.error(err);

        trackList.innerHTML="<p>Gagal memuat album.</p>";

    }

}

async function addSong(song){

    const playlist=prompt("Masukkan nama playlist");

    if(!playlist) return;

    const res=await fetch("/playlist/add-song",{

        method:"POST",

        headers:{

            "Content-Type":"application/json"

        },

        body:JSON.stringify({

            title:playlist,

            song:song

        })

    });

    if(res.ok){

        alert("Lagu berhasil ditambahkan.");

    }else{

        alert("Gagal menambahkan lagu.");

    }

}

loadAlbumDetail();