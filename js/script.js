'use strict';

const PLAYLIST_FILES = [
    'assets/playlists/playlist1.json',
    'assets/playlists/playlist2.json',
    'assets/playlists/playlist3.json',
];

const state = {
    playlists: [],
    allTracks: [],
    currentIndex: -1,
    isPlaying: false,
    isShuffle: false,
    isLoop: false,
    volume: 1,
    isMuted: false,
    previousVolume: 1,
};

const audio = document.getElementById('audio-player');
const playPauseBtn = document.getElementById('play-pause-btn');
const playPauseIcon = document.getElementById('play-pause-icon');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const shuffleBtn = document.getElementById('shuffle-btn');
const loopBtn = document.getElementById('loop-btn');
const speakerBtn = document.getElementById('speaker-btn');
const speakerIcon = document.getElementById('speaker-icon');
const progressBar = document.getElementById('progress-bar');
const currentProgressEl = document.getElementById('current-progress');
const progressThumb = document.getElementById('progress-thumb');
const volumeBar = document.getElementById('volume-bar');
const currentVolumeEl = document.getElementById('current-volume');
const volumeThumb = document.getElementById('volume-thumb');
const currentTimeEl = document.getElementById('current-time');
const totalTimeEl = document.getElementById('total-time');
const playerThumbImg = document.getElementById('player-thumb-img');
const playerSongTitle = document.getElementById('player-song-title');
const playerArtists = document.getElementById('player-artists');
const addToLikedBtn = document.getElementById('add-to-liked-btn');

const feedGrid = document.getElementById('feed-grid');
const songCardSections = document.getElementById('song-card-sections');


const libraryCards = document.getElementById('library-cards');
const likedSongsCount = document.getElementById('liked-songs-count');


const rightPanelTitle = document.getElementById('right-panel-title');
const rightPanelCover = document.getElementById('right-panel-cover');
const rightPanelSongTitle = document.getElementById('right-panel-song-title');
const rightPanelArtists = document.getElementById('right-panel-artists');
const creditsList = document.getElementById('credits-list');
const queueList = document.getElementById('queue-list');


const midSection = document.querySelector('.mid-section');
const rightSection = document.querySelector('.right-section');
const mainGrid = document.querySelector('.main');
const leftSection = document.querySelector('.left-section');
const leftArrow = leftSection.querySelector('.collapse-btn');
const leftFsBtn = leftSection.querySelector('.left-section-fs-btn');
const rightArrow = document.querySelector('.right-collapse-btn');
const rightFsBtn = document.querySelector('.right-section-fs-btn');


const filterTags = document.querySelectorAll('.mid-section .tag[data-filter]');





function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

function artistString(artists) {
    return Array.isArray(artists) ? artists.join(', ') : artists;
}





async function loadPlaylists() {
    const results = await Promise.allSettled(
        PLAYLIST_FILES.map(url => fetch(url).then(r => {
            if (!r.ok) throw new Error(`Failed: ${url}`);
            return r.json();
        }))
    );

    state.playlists = results
        .filter(r => r.status === 'fulfilled')
        .map(r => r.value);


    state.allTracks = [];
    state.playlists.forEach(pl => {
        pl.tracks.forEach(track => {
            state.allTracks.push({ ...track, playlistId: pl.id, playlistName: pl.name, playlistCover: pl.cover });
        });
    });

    likedSongsCount.textContent = `${state.allTracks.length} Songs`;
}





function renderFeed() {
    renderFeedGrid();
    renderSongCardSections();
}

function renderFeedGrid() {
    feedGrid.innerHTML = '';
    state.playlists.forEach(pl => {
        const firstTrack = pl.tracks[0];
        const globalIdx = state.allTracks.findIndex(t => t.id === firstTrack.id);

        const card = document.createElement('div');
        card.className = 'mid-section-card flex-space-between';
        card.dataset.trackIndex = globalIdx;
        card.dataset.playlistId = pl.id;

        card.innerHTML = `
            <div class="image-container flex-center height-100">
                <img class="reset height-100" src="${pl.cover}" alt="${pl.name}" onerror="this.src='https:
            </div>
            <div class="text-and-button flex-space-between">
                <h3 class="color-primary mid-card-title">${pl.name}</h3>
                <div class="flex-center mid-card-play-btn-container" data-track-index="${globalIdx}">
                    <img class="svg-btn invert-1" src="assets/svgs/play.svg" alt="play">
                </div>
            </div>
        `;

        card.addEventListener('click', () => {
            if (state.currentIndex === globalIdx && state.isPlaying) {
                pauseTrack();
            } else {
                playTrack(globalIdx);
            }
        });

        feedGrid.appendChild(card);
    });
}

/** Song card rows: one section per playlist */
function renderSongCardSections() {
    songCardSections.innerHTML = '';

    state.playlists.forEach(pl => {
        const section = document.createElement('div');
        section.className = 'radio flex-column';
        section.dataset.playlistId = pl.id;

        const titleRow = document.createElement('div');
        titleRow.className = 'radio-title flex-space-between';
        titleRow.innerHTML = `
            <h3 class="color-primary padding-10">${pl.name}</h3>
            <a href="#">Show all</a>
        `;
        section.appendChild(titleRow);

        const cardsRow = document.createElement('div');
        cardsRow.className = 'song-cards flex';

        pl.tracks.forEach(track => {
            const globalIdx = state.allTracks.findIndex(t => t.id === track.id);
            const card = createSongCard(track, globalIdx);
            cardsRow.appendChild(card);
        });

        section.appendChild(cardsRow);
        songCardSections.appendChild(section);
    });
}

function createSongCard(track, globalIdx) {
    const card = document.createElement('div');
    card.className = 'song-card';
    card.dataset.trackIndex = globalIdx;

    card.innerHTML = `
        <div class="song-big-image">
            <img class="song-card-image" src="${track.cover}" alt="${track.title}" onerror="this.src='https:
            <div class="flex-center mid-card-play-btn-container song-card-play-btn-container" data-track-index="${globalIdx}">
                <img class="svg-btn invert-1" src="assets/svgs/play.svg" alt="play">
            </div>
        </div>
        <div class="meta-data-song-card">
            <h3 class="color-primary song-card-title">${track.title}</h3>
            <p class="color-dark-text text-small">${artistString(track.artists)}</p>
        </div>
    `;

    card.addEventListener('click', () => {
        if (state.currentIndex === globalIdx && state.isPlaying) {
            pauseTrack();
        } else {
            playTrack(globalIdx);
        }
    });

    return card;
}


function renderLibrary() {

    const existingPlaylistCards = libraryCards.querySelectorAll('.card[data-playlist-card]');
    existingPlaylistCards.forEach(c => c.remove());

    state.playlists.forEach(pl => {
        const firstTrack = pl.tracks[0];
        const globalIdx = state.allTracks.findIndex(t => t.id === firstTrack.id);

        const card = document.createElement('div');
        card.className = 'card flex-center';
        card.dataset.playlistCard = pl.id;
        card.dataset.playlistId = pl.id;

        card.innerHTML = `
            <div class="left__section-card-icon flex-center">
                <img src="${pl.cover}" alt="${pl.name}" onerror="this.src='https:
                <div class="container flex-center card-play-btn-container">
                    <img class="svg-btn-small card-play-btn" src="assets/svgs/play.svg" alt="play icon">
                </div>
            </div>
            <div class="left__section-title">
                <p class="text-bold color-primary card-title">${pl.name}</p>
                <div class="left__section-title-data color-dark-text text-bold">
                    <span>Playlist · </span>
                    <span>${pl.tracks.length} songs</span>
                </div>
            </div>
        `;

        card.addEventListener('click', () => {
            playTrack(globalIdx);
        });

        libraryCards.appendChild(card);
    });
}


function renderRightPanel(track) {
    if (!track) return;

    rightPanelTitle.textContent = track.title;
    rightPanelCover.src = track.cover;
    rightPanelCover.alt = track.title;
    rightPanelSongTitle.textContent = track.title;
    rightPanelArtists.textContent = artistString(track.artists);


    creditsList.innerHTML = '';
    const artists = Array.isArray(track.artists) ? track.artists : [track.artists];
    const roles = ['Main Artist', 'Composer', 'Lyricist', 'Producer'];
    artists.forEach((artist, i) => {
        const div = document.createElement('div');
        div.className = 'credit flex-space-between';
        div.innerHTML = `
            <div class="credit-artist-name">
                <p class="color-primary text-bold">${artist}</p>
                <p class="color-dark-text">${roles[i % roles.length]}</p>
            </div>
            <button class="follow-btn">Follow</button>
        `;
        creditsList.appendChild(div);
    });


    queueList.innerHTML = '';
    const nextIndices = getNextIndices(3);
    nextIndices.forEach(idx => {
        const t = state.allTracks[idx];
        if (!t) return;
        const div = document.createElement('div');
        div.className = 'queue-song flex-space-between';
        div.dataset.trackIndex = idx;
        div.innerHTML = `
            <div class="queue-song-info flex gap-10">
                <div class="queue-song-thumbnail">
                    <img src="${t.cover}" alt="${t.title}" onerror="this.src='https:
                </div>
                <div class="queue-song-meta">
                    <a class="queue-song-meta-title color-primary" href="#">${t.title}</a>
                    <ul class="queue-song-meta-artists flex text-small">
                        ${(Array.isArray(t.artists) ? t.artists : [t.artists]).map(a => `<li><a href="#">${a}</a></li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
        div.addEventListener('click', () => playTrack(idx));
        queueList.appendChild(div);
    });
}

/** Get next N track indices (handles loop/wrap) */
function getNextIndices(count) {
    const indices = [];
    const total = state.allTracks.length;
    if (total === 0) return indices;
    for (let i = 1; i <= count; i++) {
        indices.push((state.currentIndex + i) % total);
    }
    return indices;
}


function loadTrack(index) {
    if (index < 0 || index >= state.allTracks.length) return;
    state.currentIndex = index;
    const track = state.allTracks[index];


    audio.src = track.src;
    audio.load();


    playerThumbImg.src = track.cover;
    playerThumbImg.alt = track.title;
    playerSongTitle.textContent = track.title;

    const artistsArr = Array.isArray(track.artists) ? track.artists : [track.artists];
    playerArtists.innerHTML = artistsArr.map(a => `<li><a href="#">${a}</a></li>`).join('');


    currentTimeEl.textContent = '0:00';
    totalTimeEl.textContent = formatTime(track.duration);
    setProgressWidth(0);
    setVolumeWidth(state.volume * 100);


    renderRightPanel(track);


    updatePlayingHighlights();
}

function playTrack(index) {
    if (index !== state.currentIndex) {
        loadTrack(index);
    }
    resumeTrack();
}

function resumeTrack() {
    audio.play().catch(() => {

    });
    state.isPlaying = true;
    setPlayIcon(true);
    updatePlayingHighlights();
}

function pauseTrack() {
    audio.pause();
    state.isPlaying = false;
    setPlayIcon(false);
    updatePlayingHighlights();
}

function togglePlayPause() {
    if (state.currentIndex === -1) {

        playTrack(0);
        return;
    }
    if (state.isPlaying) {
        pauseTrack();
    } else {
        resumeTrack();
    }
}

function nextTrack() {
    if (state.allTracks.length === 0) return;
    let next;
    if (state.isShuffle) {
        let rand;
        do { rand = Math.floor(Math.random() * state.allTracks.length); }
        while (rand === state.currentIndex && state.allTracks.length > 1);
        next = rand;
    } else {
        next = (state.currentIndex + 1) % state.allTracks.length;
    }
    playTrack(next);
}

function prevTrack() {
    if (state.allTracks.length === 0) return;

    if (audio.currentTime > 3) {
        audio.currentTime = 0;
        return;
    }
    const prev = (state.currentIndex - 1 + state.allTracks.length) % state.allTracks.length;
    playTrack(prev);
}

function toggleShuffle() {
    state.isShuffle = !state.isShuffle;
    shuffleBtn.classList.toggle('active', state.isShuffle);
    shuffleBtn.title = state.isShuffle ? 'Disable Shuffle' : 'Enable Shuffle';
}

function toggleLoop() {
    state.isLoop = !state.isLoop;
    audio.loop = state.isLoop;
    loopBtn.classList.toggle('active', state.isLoop);
    loopBtn.title = state.isLoop ? 'Disable Repeat' : 'Enable Repeat';
}

function toggleMute() {
    if (state.isMuted) {
        state.isMuted = false;
        state.volume = state.previousVolume || 0.7;
        audio.volume = state.volume;
        audio.muted = false;
        speakerIcon.src = 'assets/svgs/speaker.svg';
        setVolumeWidth(state.volume * 100);
    } else {
        state.isMuted = true;
        state.previousVolume = state.volume;
        audio.muted = true;
        speakerIcon.src = 'assets/svgs/speaker-off.svg';
        setVolumeWidth(0);
    }
}

function setVolume(fraction) {
    state.volume = Math.max(0, Math.min(1, fraction));
    audio.volume = state.volume;
    state.isMuted = state.volume === 0;
    audio.muted = state.isMuted;
    speakerIcon.src = state.isMuted ? 'assets/svgs/speaker-off.svg' : 'assets/svgs/speaker.svg';
    setVolumeWidth(state.volume * 100);
}


function setProgressWidth(percent) {
    const clamped = Math.max(0, Math.min(100, percent));
    currentProgressEl.style.width = `${clamped}%`;
    progressThumb.style.left = `${clamped}%`;
}

function setVolumeWidth(percent) {
    const clamped = Math.max(0, Math.min(100, percent));
    currentVolumeEl.style.width = `${clamped}%`;
    volumeThumb.style.left = `${clamped}%`;
}

function seekFromClick(e) {
    const rect = progressBar.getBoundingClientRect();
    const fraction = (e.clientX - rect.left) / rect.width;
    const newTime = fraction * audio.duration;
    if (!isNaN(newTime)) {
        audio.currentTime = newTime;
        setProgressWidth(fraction * 100);
    }
}

function setVolumeFromClick(e) {
    const rect = volumeBar.getBoundingClientRect();
    const fraction = (e.clientX - rect.left) / rect.width;
    setVolume(fraction);
    if (fraction > 0) state.previousVolume = fraction;
}


function setPlayIcon(playing) {
    playPauseIcon.src = playing ? 'assets/svgs/pause.svg' : 'assets/svgs/play.svg';
    playPauseIcon.alt = playing ? 'pause icon' : 'play icon';
    playPauseBtn.title = playing ? 'Pause' : 'Play';


    updateCardPlayIcons();
}

/** Sync play/pause icons on the individual song cards */
function updateCardPlayIcons() {
    document.querySelectorAll('.mid-card-play-btn-container img, .card-play-btn').forEach(img => {
        const container = img.closest('[data-track-index]') || img.closest('.card[data-playlist-id]');
        if (!container) return;
        const idx = parseInt(container.dataset.trackIndex ?? -1);
        const isThis = (idx === state.currentIndex);
        img.src = (isThis && state.isPlaying) ? 'assets/svgs/pause.svg' : 'assets/svgs/play.svg';
    });
}


function updatePlayingHighlights() {

    document.querySelectorAll('.song-card, .mid-section-card, .card[data-playlist-card]').forEach(el => {
        const idx = parseInt(el.dataset.trackIndex ?? -1);
        el.classList.toggle('is-playing', idx === state.currentIndex && state.isPlaying);
    });

    updateCardPlayIcons();
}

audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    setProgressWidth(pct);
    currentTimeEl.textContent = formatTime(audio.currentTime);
});

audio.addEventListener('loadedmetadata', () => {
    totalTimeEl.textContent = formatTime(audio.duration);
});

audio.addEventListener('ended', () => {
    if (!state.isLoop) {
        nextTrack();
    }

});

audio.addEventListener('error', () => {

    state.isPlaying = false;
    setPlayIcon(false);
});





playPauseBtn.addEventListener('click', togglePlayPause);
prevBtn.addEventListener('click', prevTrack);
nextBtn.addEventListener('click', nextTrack);
shuffleBtn.addEventListener('click', toggleShuffle);
loopBtn.addEventListener('click', toggleLoop);
speakerBtn.addEventListener('click', toggleMute);


let isDraggingProgress = false;
progressBar.addEventListener('mousedown', (e) => {
    isDraggingProgress = true;
    seekFromClick(e);
});
document.addEventListener('mousemove', (e) => {
    if (isDraggingProgress) seekFromClick(e);
});
document.addEventListener('mouseup', () => { isDraggingProgress = false; });


let isDraggingVolume = false;
volumeBar.addEventListener('mousedown', (e) => {
    isDraggingVolume = true;
    setVolumeFromClick(e);
});
document.addEventListener('mousemove', (e) => {
    if (isDraggingVolume) setVolumeFromClick(e);
});
document.addEventListener('mouseup', () => { isDraggingVolume = false; });


document.addEventListener('keydown', (e) => {
    const tag = document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;

    switch (e.code) {
        case 'Space':
            e.preventDefault();
            togglePlayPause();
            break;
        case 'ArrowRight':
            e.preventDefault();
            if (audio.duration) audio.currentTime = Math.min(audio.currentTime + 5, audio.duration);
            break;
        case 'ArrowLeft':
            e.preventDefault();
            audio.currentTime = Math.max(audio.currentTime - 5, 0);
            break;
        case 'ArrowUp':
            e.preventDefault();
            setVolume(state.volume + 0.05);
            break;
        case 'ArrowDown':
            e.preventDefault();
            setVolume(state.volume - 0.05);
            break;
        case 'KeyM':
            toggleMute();
            break;
        case 'KeyS':
            toggleShuffle();
            break;
        case 'KeyL':
            toggleLoop();
            break;
    }
});





filterTags.forEach(tag => {
    tag.addEventListener('click', () => {
        filterTags.forEach(t => t.classList.remove('active'));
        tag.classList.add('active');
        const filter = tag.dataset.filter;
        applyFeedFilter(filter);
    });
});

function applyFeedFilter(filter) {
    const sections = songCardSections.querySelectorAll('.radio');
    if (filter === 'all') {
        feedGrid.style.display = '';
        sections.forEach(s => s.style.display = '');
    } else if (filter === 'music') {
        feedGrid.style.display = 'none';
        sections.forEach(s => s.style.display = '');
    } else if (filter === 'playlist') {
        feedGrid.style.display = '';
        sections.forEach(s => s.style.display = 'none');
    }
}





let leftCollapsed = false;
let rightCollapsed = false;

const COLLAPSE_BREAKPOINT = 992;

function updateGrid() {
    if (window.innerWidth <= COLLAPSE_BREAKPOINT) {
        mainGrid.style.gridTemplateColumns = '';
        return;
    }
    const leftCol = leftCollapsed ? '64px' : '1fr';
    const rightCol = rightCollapsed ? '64px' : '1fr';
    mainGrid.style.gridTemplateColumns = `${leftCol} 2fr ${rightCol}`;
}

function collapseLeft() {
    leftCollapsed = !leftCollapsed;
    leftSection.setAttribute('collapsed', leftCollapsed ? 'true' : 'false');
    updateGrid();
    if (leftArrow) {
        leftArrow.querySelector('img').src = leftCollapsed
            ? 'assets/svgs/collapse_right.svg'
            : 'assets/svgs/collapse_left.svg';
    }
}

function collapseRight() {
    rightCollapsed = !rightCollapsed;
    rightSection.setAttribute('collapsed', rightCollapsed ? 'true' : 'false');
    updateGrid();
    if (rightArrow) {
        rightArrow.querySelector('img').src = rightCollapsed
            ? 'assets/svgs/collapse_left.svg'
            : 'assets/svgs/collapse_right.svg';
    }
}

[leftArrow, leftFsBtn].forEach(btn => btn && btn.addEventListener('click', collapseLeft));
[rightArrow, rightFsBtn].forEach(btn => btn && btn.addEventListener('click', collapseRight));
window.addEventListener('resize', updateGrid);





midSection.addEventListener('scroll', (e) => {
    midSection.setAttribute('scrolled', e.target.scrollTop > 5 ? 'true' : 'false');
});

rightSection.addEventListener('scroll', (e) => {
    rightSection.setAttribute('scrolled', e.target.scrollTop > 5 ? 'true' : 'false');
});





audio.volume = state.volume;
setVolumeWidth(state.volume * 100);

async function init() {
    await loadPlaylists();
    renderFeed();
    renderLibrary();


    if (state.allTracks.length > 0) {
        loadTrack(0);
    }
}

init();
