import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import path from 'path';
import { playlists, addSongToPlaylist, removeSongFromPlaylist } from './playlist';

const getQueryString = (param: any): string => {
  if (Array.isArray(param)) return param[0] as string;
  return param ? String(param) : "";
};

const fetchFn = async (...args: any[]) => {
  const mod = await import('node-fetch');
  return (mod.default as any)(...args);
};

const app = express();
const PORT = Number(process.env.PORT) || 4000;
const API_KEY = process.env.LASTFM_API_KEY || "";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// search lagu
app.get('/search', async (req: Request, res: Response) => {
  try {
    const artist = getQueryString(req.query.q);
    const url = `http://ws.audioscrobbler.com/2.0/?method=artist.gettoptracks&artist=${encodeURIComponent(artist)}&api_key=${API_KEY}&format=json`;
    const response = await fetchFn(url);
    const data = await response.json();

    if (!data.toptracks) {
      return res.json([]);
    }

    const results = data.toptracks.track.map((t: any) => ({
      title: t.name,
      artist: t.artist.name,
      image: t.image && t.image.length ? t.image[t.image.length - 1]["#text"] : ""
    }));

    res.json(results);
  } catch {
    res.status(500).json({ error: "Failed" });
  }
});

// data album
app.get('/albums', async (req: Request, res: Response) => {
  try {
    const artist = getQueryString(req.query.q);
    const url = `http://ws.audioscrobbler.com/2.0/?method=artist.gettopalbums&artist=${encodeURIComponent(artist)}&api_key=${API_KEY}&format=json`;
    const response = await fetchFn(url);
    const data = await response.json();

    if (!data.topalbums) {
      return res.json([]);
    }

    const results = data.topalbums.album.map((a: any) => ({
      title: a.name,
      artist: a.artist.name,
      image: a.image && a.image.length ? a.image[a.image.length - 1]["#text"] : ""
    }));

    res.json(results);
  } catch {
    res.status(500).json({ error: "Failed" });
  }
});

// detail album
app.get('/album-details', async (req: Request, res: Response) => {
  try {
    const artist = getQueryString(req.query.artist);
    const album = getQueryString(req.query.album);
    const url = `http://ws.audioscrobbler.com/2.0/?method=album.getinfo&artist=${encodeURIComponent(artist)}&album=${encodeURIComponent(album)}&api_key=${API_KEY}&format=json`;
    const response = await fetchFn(url);
    const data = await response.json();

    if (!data.album) {
      return res.status(404).json({ error: "Album tidak ditemukan" });
    }

    const albumData = data.album;
    const tracks = Array.isArray(albumData.tracks?.track)
      ? albumData.tracks.track
      : albumData.tracks?.track
        ? [albumData.tracks.track]
        : [];

    res.json({
      name: albumData.name,
      artist: albumData.artist,
      image: albumData.image?.length ? albumData.image[albumData.image.length - 1]["#text"] : "",
      listeners: albumData.listeners || "0",
      playcount: albumData.playcount || "0",
      tracks: tracks
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed" });
  }
});

// tambah playlist 
app.post('/playlist/add-song', (req: Request, res: Response) => {
    const title = String(req.body.title);
    const song = String(req.body.song);
    // Menangkap parameter forceAdd dari frontend
    const forceAdd = !!req.body.forceAdd; 
    
    // Proses dengan meneruskan parameter forceAdd
    const result = addSongToPlaylist(title, song, forceAdd);
    res.json(result);
});

// hapus lagu dari playlist
app.post('/playlist/remove-song', (req: Request, res: Response) => {
    const { playlistId, song } = req.body;
    const result = removeSongFromPlaylist(parseInt(playlistId), song);
    res.json(result);
});

// ambil playlist
app.get('/my-playlists', (req: Request, res: Response) => {
    res.json(playlists);
});

// cari playlist
app.get('/playlist/:id', (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string);
    const playlist = playlists.find(p => p.id === id);
    
    if (!playlist) {
        return res.status(404).json({ error: "Playlist tidak ditemukan" });
    }
    
    res.json(playlist);
});

// hapus playlist
app.delete('/playlist/:id', (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string);
    const index = playlists.findIndex(p => p.id === id);
    if (index !== -1) {
        playlists.splice(index, 1);
    }
    res.json({ success: true });
});

if (process.env.VERCEL !== "1") {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

export default app;