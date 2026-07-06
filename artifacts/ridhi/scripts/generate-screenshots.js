#!/usr/bin/env node
/**
 * Generate App Store screenshots for Ridhi
 * Uses puppeteer-core + system Chromium
 */

const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.resolve(__dirname, '../../screenshots');
const CHROMIUM = '/nix/store/qa9cnw4v5xkxyip6mb9kxqfq1z4x2dx1-chromium-138.0.7204.100/bin/chromium-browser';

const BRAND = {
  purple: '#7B2FBE',
  pink: '#E91E8C',
  darkBg: '#0A0A0F',
  cardBg: '#14141E',
  text: '#FFFFFF',
  textMuted: '#9CA3AF',
};

// SVG icons as inline strings
const ICONS = {
  heart: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  comment: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  send: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
  bookmark: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`,
  search: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  bell: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
  menu: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`,
  pencil: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>`,
  undo: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>`,
  close: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  star: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  music: `<svg width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="none"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,
  home: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  searchTab: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  heartTab: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  chatTab: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  userTab: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  check: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  camera: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`,
  grid: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
  video: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2"22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>`,
  users: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
};

const SCREENS = [
  { id: 'home-feed', title: 'Home Feed', tagline: 'Discover trending content from creators worldwide' },
  { id: 'reels', title: 'Reels', tagline: 'Endless short-form entertainment' },
  { id: 'dating', title: 'Dating', tagline: 'Find your perfect match' },
  { id: 'chat', title: 'Chat', tagline: 'Connect with friends and matches' },
  { id: 'profile', title: 'Profile', tagline: 'Showcase your story' },
];

function generateHTML(screen, width, height) {
  const stories = Array.from({ length: 6 }, (_, i) => ({
    name: ['Ananya', 'Rahul', 'Priya', 'Vikram', 'Sneha', 'Arjun'][i],
    active: i < 3,
    img: `https://i.pravatar.cc/150?img=${i+10}`,
  }));

  const posts = Array.from({ length: 3 }, (_, i) => ({
    user: ['creator_riya', 'tech_vlogger', 'foodie_aditi'][i],
    avatar: `https://i.pravatar.cc/150?img=${i*2+1}`,
    likes: [2340, 1892, 3421][i],
    comments: [128, 95, 203][i],
    time: ['2h', '4h', '6h'][i],
    caption: [
      'Just dropped my new collection! What do you think? #fashion #newdrop',
      'Top 5 AI tools you need to try in 2026 #tech #ai',
      'Homemade biryani recipe that will change your life #food #recipe',
    ][i],
    img: `https://picsum.photos/seed/ridhi${i}/800/600`,
  }));

  let content = '';

  if (screen.id === 'home-feed') {
    content = `
      <div style="height:54px; display:flex; align-items:center; justify-content:space-between; padding:0 24px; padding-top:12px;">
        <span style="font-size:16px; font-weight:700;">9:41</span>
        <div style="display:flex; gap:4px; font-size:14px; color:white;">
          <span>5G</span><span>86%</span>
        </div>
      </div>
      <div style="display:flex; align-items:center; justify-content:space-between; padding:0 20px; height:52px;">
        <div style="font-size:22px; font-weight:800; background:linear-gradient(135deg,${BRAND.purple},${BRAND.pink}); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">Ridhi</div>
        <div style="display:flex; gap:16px;">${ICONS.search}${ICONS.bell}</div>
      </div>
      <div style="display:flex; gap:14px; padding:12px 20px; overflow-x:auto;">
        ${stories.map(s => `
          <div style="display:flex; flex-direction:column; align-items:center; gap:6px; flex-shrink:0;">
            <div style="width:68px; height:68px; border-radius:50%; padding:3px; background:${s.active ? `linear-gradient(135deg,${BRAND.purple},${BRAND.pink})` : '#333'};">
              <img src="${s.img}" style="width:62px; height:62px; border-radius:50%; object-fit:cover; border:2px solid ${BRAND.darkBg};" crossorigin="anonymous" />
            </div>
            <span style="font-size:11px; color:${BRAND.textMuted};">${s.name}</span>
          </div>
        `).join('')}
      </div>
      <div style="padding:0 16px;">
        ${posts.map(p => `
          <div style="background:${BRAND.cardBg}; border-radius:16px; margin-bottom:16px; overflow:hidden;">
            <div style="display:flex; align-items:center; gap:10px; padding:12px 14px;">
              <img src="${p.avatar}" style="width:36px; height:36px; border-radius:50%; object-fit:cover;" crossorigin="anonymous" />
              <div style="flex:1;">
                <div style="font-size:13px; font-weight:600;">${p.user}</div>
                <div style="font-size:11px; color:${BRAND.textMuted};">${p.time}</div>
              </div>
              <span style="font-size:16px; color:${BRAND.textMuted};">⋯</span>
            </div>
            <div style="height:340px; background:linear-gradient(135deg,#1a0a2e,#2d0a1e); display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden;">
              <img src="${p.img}" style="width:100%; height:100%; object-fit:cover; opacity:0.6;" crossorigin="anonymous" />
              <div style="position:absolute; bottom:16px; left:16px; right:16px; background:rgba(0,0,0,0.6); backdrop-filter:blur(8px); padding:12px 14px; border-radius:12px;">
                <div style="font-size:13px; line-height:1.4;">${p.caption}</div>
              </div>
            </div>
            <div style="padding:12px 14px;">
              <div style="display:flex; gap:16px; margin-bottom:8px;">${ICONS.heart}${ICONS.comment}${ICONS.send}<span style="margin-left:auto;">${ICONS.bookmark}</span></div>
              <div style="font-size:13px; font-weight:600; margin-bottom:4px;">${p.likes.toLocaleString()} likes</div>
              <div style="font-size:13px; line-height:1.5;"><b>${p.user}</b> ${p.caption.substring(0, 60)}...</div>
            </div>
          </div>
        `).join('')}
      </div>
      <div style="position:absolute; bottom:0; left:0; right:0; height:80px; background:rgba(10,10,15,0.95); backdrop-filter:blur(20px); border-top:1px solid rgba(255,255,255,0.05); display:flex; align-items:center; justify-content:space-around; padding-bottom:20px;">
        <div style="display:flex; flex-direction:column; align-items:center; gap:3px;">${ICONS.home}<div style="width:4px; height:4px; border-radius:50%; background:${BRAND.pink};"></div></div>
        <div>${ICONS.searchTab}</div>
        <div style="background:linear-gradient(135deg,${BRAND.purple},${BRAND.pink}); -webkit-background-clip:text;">${ICONS.heartTab}</div>
        <div>${ICONS.chatTab}</div>
        <div>${ICONS.userTab}</div>
      </div>
    `;
  } else if (screen.id === 'reels') {
    content = `
      <div style="height:100%; display:flex; flex-direction:column; justify-content:flex-end; padding:54px 20px 100px 20px; background:linear-gradient(180deg,#1a0a2e 0%, #0d0618 40%, #0a0a0f 100%);">
        <div style="position:absolute; top:54px; left:20px; font-size:16px; font-weight:700;">Reels</div>
        <div style="position:absolute; top:54px; right:20px; display:flex; gap:12px;">${ICONS.search}${ICONS.camera}</div>
        <div style="position:absolute; right:16px; top:45%; display:flex; flex-direction:column; gap:20px; align-items:center;">
          <div style="display:flex; flex-direction:column; align-items:center; gap:4px;">${ICONS.heart}<span style="font-size:11px;">12.4K</span></div>
          <div style="display:flex; flex-direction:column; align-items:center; gap:4px;">${ICONS.comment}<span style="font-size:11px;">892</span></div>
          <div style="display:flex; flex-direction:column; align-items:center; gap:4px;">${ICONS.send}<span style="font-size:11px;">Share</span></div>
          <div style="display:flex; flex-direction:column; align-items:center; gap:4px;"><span style="font-size:20px; color:${BRAND.textMuted};">⋯</span></div>
          <img src="https://i.pravatar.cc/150?img=8" style="width:44px; height:44px; border-radius:50%; border:2px solid white; object-fit:cover;" crossorigin="anonymous" />
        </div>
        <div style="max-width:280px;">
          <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">
            <img src="https://i.pravatar.cc/150?img=8" style="width:36px; height:36px; border-radius:50%; object-fit:cover;" crossorigin="anonymous" />
            <span style="font-size:14px; font-weight:600;">dance_queen</span>
            <span style="font-size:11px; padding:4px 10px; border-radius:6px; border:1px solid rgba(255,255,255,0.3);">Follow</span>
          </div>
          <div style="font-size:13px; line-height:1.5; margin-bottom:10px;">New choreography alert! Learn this step-by-step #dance #trending</div>
          <div style="display:flex; align-items:center; gap:6px; font-size:12px; color:${BRAND.textMuted};">${ICONS.music}<span>original sound - dance_queen</span></div>
        </div>
      </div>
      <div style="position:absolute; bottom:0; left:0; right:0; height:80px; background:rgba(10,10,15,0.9); backdrop-filter:blur(20px); display:flex; align-items:center; justify-content:space-around; padding-bottom:20px;">
        <div>${ICONS.home}</div><div>${ICONS.searchTab}</div><div style="background:linear-gradient(135deg,${BRAND.purple},${BRAND.pink}); -webkit-background-clip:text;">${ICONS.heartTab}</div><div>${ICONS.chatTab}</div><div>${ICONS.userTab}</div>
      </div>
    `;
  } else if (screen.id === 'dating') {
    content = `
      <div style="height:100%; display:flex; flex-direction:column; position:relative;">
        <div style="height:54px; display:flex; align-items:flex-end; justify-content:center; padding-bottom:8px; font-size:17px; font-weight:700;">Match</div>
        <div style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:20px; position:relative;">
          <div style="position:absolute; width:320px; height:440px; background:${BRAND.cardBg}; border-radius:24px; transform:translateY(-10px) scale(0.95); opacity:0.5;"></div>
          <div style="width:340px; height:480px; background:linear-gradient(180deg,#1a0a2e 0%, #2d0a1e 60%, #0a0a0f 100%); border-radius:24px; position:relative; overflow:hidden; box-shadow:0 20px 60px rgba(123,47,190,0.3);">
            <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=800&fit=crop" style="width:100%; height:100%; object-fit:cover; opacity:0.85;" crossorigin="anonymous" />
            <div style="position:absolute; bottom:0; left:0; right:0; padding:80px 20px 20px; background:linear-gradient(transparent, rgba(0,0,0,0.85));">
              <div style="display:flex; align-items:baseline; gap:8px; margin-bottom:6px;">
                <span style="font-size:24px; font-weight:700;">Meera, 24</span>
                <div style="width:18px; height:18px; border-radius:50%; background:${BRAND.purple}; display:flex; align-items:center; justify-content:center;">${ICONS.check}</div>
              </div>
              <div style="font-size:13px; color:${BRAND.textMuted}; margin-bottom:10px;">Mumbai, India • 5km away</div>
              <div style="display:flex; gap:8px; flex-wrap:wrap;">
                <span style="font-size:11px; padding:5px 12px; border-radius:20px; background:rgba(123,47,190,0.3); border:1px solid rgba(123,47,190,0.4);">Photography</span>
                <span style="font-size:11px; padding:5px 12px; border-radius:20px; background:rgba(123,47,190,0.3); border:1px solid rgba(123,47,190,0.4);">Travel</span>
                <span style="font-size:11px; padding:5px 12px; border-radius:20px; background:rgba(123,47,190,0.3); border:1px solid rgba(123,47,190,0.4);">Music</span>
              </div>
            </div>
          </div>
          <div style="display:flex; gap:24px; margin-top:24px; align-items:center;">
            <div style="width:56px; height:56px; border-radius:50%; background:rgba(255,255,255,0.1); display:flex; align-items:center; justify-content:center; border:1px solid rgba(255,255,255,0.1);">${ICONS.undo}</div>
            <div style="width:68px; height:68px; border-radius:50%; background:rgba(255,59,48,0.15); display:flex; align-items:center; justify-content:center; border:2px solid rgba(255,59,48,0.4);">${ICONS.close}</div>
            <div style="width:68px; height:68px; border-radius:50%; background:rgba(123,47,190,0.15); display:flex; align-items:center; justify-content:center; border:2px solid rgba(123,47,190,0.4);">${ICONS.heart}</div>
            <div style="width:56px; height:56px; border-radius:50%; background:rgba(255,255,255,0.1); display:flex; align-items:center; justify-content:center; border:1px solid rgba(255,255,255,0.1);">${ICONS.star}</div>
          </div>
        </div>
        <div style="height:80px; background:rgba(10,10,15,0.95); backdrop-filter:blur(20px); border-top:1px solid rgba(255,255,255,0.05); display:flex; align-items:center; justify-content:space-around; padding-bottom:20px;">
          <div>${ICONS.home}</div><div>${ICONS.searchTab}</div><div style="background:linear-gradient(135deg,${BRAND.purple},${BRAND.pink}); -webkit-background-clip:text;">${ICONS.heartTab}</div><div>${ICONS.chatTab}</div><div>${ICONS.userTab}</div>
        </div>
      </div>
    `;
  } else if (screen.id === 'chat') {
    const chats = [
      { name: 'Meera', msg: 'Hey! Want to grab coffee this weekend?', time: '2m', unread: 2, img: 'https://i.pravatar.cc/150?img=9' },
      { name: 'Rahul', msg: 'That reel was hilarious!', time: '1h', unread: 0, img: 'https://i.pravatar.cc/150?img=3' },
      { name: 'Priya', msg: 'Sent a photo', time: '3h', unread: 1, img: 'https://i.pravatar.cc/150?img=5' },
      { name: 'Weekend Plans', msg: 'Arjun: I\'m in!', time: '5h', unread: 5, img: 'https://i.pravatar.cc/150?img=12' },
    ];
    content = `
      <div style="height:100%; display:flex; flex-direction:column;">
        <div style="height:54px; display:flex; align-items:flex-end; justify-content:space-between; padding:0 20px 8px;">
          <span style="font-size:22px; font-weight:800;">Messages</span>
          <div>${ICONS.pencil}</div>
        </div>
        <div style="padding:8px 16px;">
          <div style="background:${BRAND.cardBg}; border-radius:12px; padding:10px 14px; display:flex; align-items:center; gap:8px;">
            <div style="color:${BRAND.textMuted};">${ICONS.search}</div>
            <span style="font-size:14px; color:${BRAND.textMuted};">Search messages</span>
          </div>
        </div>
        <div style="flex:1; overflow:hidden;">
          ${chats.map(c => `
            <div style="display:flex; align-items:center; gap:12px; padding:12px 16px; border-bottom:1px solid rgba(255,255,255,0.03);">
              <div style="position:relative;">
                <img src="${c.img}" style="width:52px; height:52px; border-radius:50%; object-fit:cover;" crossorigin="anonymous" />
                ${c.unread > 0 ? `<div style="position:absolute; bottom:0; right:0; width:18px; height:18px; background:${BRAND.pink}; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:700; border:2px solid ${BRAND.darkBg};">${c.unread}</div>` : ''}
              </div>
              <div style="flex:1; min-width:0;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                  <span style="font-size:15px; font-weight:600;">${c.name}</span>
                  <span style="font-size:12px; color:${BRAND.textMuted};">${c.time}</span>
                </div>
                <div style="font-size:14px; color:${c.unread > 0 ? BRAND.text : BRAND.textMuted}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:240px;">${c.msg}</div>
              </div>
            </div>
          `).join('')}
        </div>
        <div style="height:80px; background:rgba(10,10,15,0.95); backdrop-filter:blur(20px); border-top:1px solid rgba(255,255,255,0.05); display:flex; align-items:center; justify-content:space-around; padding-bottom:20px;">
          <div>${ICONS.home}</div><div>${ICONS.searchTab}</div><div>${ICONS.heartTab}</div><div style="background:linear-gradient(135deg,${BRAND.purple},${BRAND.pink}); -webkit-background-clip:text;">${ICONS.chatTab}</div><div>${ICONS.userTab}</div>
        </div>
      </div>
    `;
  } else if (screen.id === 'profile') {
    content = `
      <div style="height:100%; display:flex; flex-direction:column;">
        <div style="height:54px; display:flex; align-items:flex-end; justify-content:space-between; padding:0 20px 8px;">
          <span style="font-size:17px; font-weight:700;">jadaprulu_hareesh</span>
          <div>${ICONS.menu}</div>
        </div>
        <div style="padding:16px 20px;">
          <div style="display:flex; align-items:center; gap:16px; margin-bottom:16px;">
            <img src="https://i.pravatar.cc/150?img=11" style="width:80px; height:80px; border-radius:50%; object-fit:cover; border:3px solid ${BRAND.purple}; padding:2px;" crossorigin="anonymous" />
            <div style="flex:1; display:flex; justify-content:space-around;">
              <div style="text-align:center;"><div style="font-size:18px; font-weight:700;">142</div><div style="font-size:12px; color:${BRAND.textMuted};">Posts</div></div>
              <div style="text-align:center;"><div style="font-size:18px; font-weight:700;">12.5K</div><div style="font-size:12px; color:${BRAND.textMuted};">Followers</div></div>
              <div style="text-align:center;"><div style="font-size:18px; font-weight:700;">892</div><div style="font-size:12px; color:${BRAND.textMuted};">Following</div></div>
            </div>
          </div>
          <div style="margin-bottom:12px;">
            <div style="font-size:15px; font-weight:600;">Jadaprulu Hareesh</div>
            <div style="font-size:13px; color:${BRAND.textMuted}; line-height:1.5;">Founder @ Krilodigitech • Building Ridhi<br/>India • Tech • Creator Economy</div>
          </div>
          <div style="display:flex; gap:10px;">
            <div style="flex:1; background:${BRAND.cardBg}; border-radius:10px; padding:8px 0; text-align:center; font-size:14px; font-weight:600;">Edit Profile</div>
            <div style="flex:1; background:linear-gradient(135deg,${BRAND.purple},${BRAND.pink}); border-radius:10px; padding:8px 0; text-align:center; font-size:14px; font-weight:600;">Share Profile</div>
          </div>
        </div>
        <div style="display:flex; gap:14px; padding:8px 20px;">
          ${['Creator', 'Travel', 'Behind', 'Collabs'].map((h, i) => `
            <div style="display:flex; flex-direction:column; align-items:center; gap:4px;">
              <div style="width:60px; height:60px; border-radius:50%; background:linear-gradient(135deg,${BRAND.purple},${BRAND.pink}); padding:2px;">
                <div style="width:56px; height:56px; border-radius:50%; background:${BRAND.cardBg}; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:600;">${h}</div>
              </div>
            </div>
          `).join('')}
        </div>
        <div style="display:flex; border-bottom:1px solid rgba(255,255,255,0.05); margin-top:8px;">
          <div style="flex:1; display:flex; justify-content:center; padding:10px 0; border-bottom:2px solid ${BRAND.pink};">${ICONS.grid}</div>
          <div style="flex:1; display:flex; justify-content:center; padding:10px 0; opacity:0.5;">${ICONS.video}</div>
          <div style="flex:1; display:flex; justify-content:center; padding:10px 0; opacity:0.5;">${ICONS.users}</div>
        </div>
        <div style="flex:1; display:grid; grid-template-columns:repeat(3, 1fr); gap:2px; padding:2px;">
          ${Array.from({length:9}, (_, i) => `
            <div style="aspect-ratio:1; background:linear-gradient(135deg, ${['#1a0a2e','#2d0a1e','#0a1a2e','#1e0a2d','#2e1a0a','#0a2e1a','#1a2e0a','#2e0a1a','#0a1e2e'][i]}, ${['#2d0a1e','#1a0a2e','#0a1a2e','#2e1a0a','#1e0a2d','#0a2e1a','#2e0a1a','#1a2e0a','#0a1e2e'][i]}); display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:600; color:rgba(255,255,255,0.3);">
              ${['Post','Reel','Photo','Story','Collab','Live','Pod','Event','Review'][i]}
            </div>
          `).join('')}
        </div>
        <div style="height:80px; background:rgba(10,10,15,0.95); backdrop-filter:blur(20px); border-top:1px solid rgba(255,255,255,0.05); display:flex; align-items:center; justify-content:space-around; padding-bottom:20px;">
          <div>${ICONS.home}</div><div>${ICONS.searchTab}</div><div>${ICONS.heartTab}</div><div>${ICONS.chatTab}</div><div style="background:linear-gradient(135deg,${BRAND.purple},${BRAND.pink}); -webkit-background-clip:text;">${ICONS.userTab}</div>
        </div>
      </div>
    `;
  }

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; -webkit-font-smoothing: antialiased; }
    body {
      width: ${width}px;
      height: ${height}px;
      background: ${BRAND.darkBg};
      color: ${BRAND.text};
      font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif;
      overflow: hidden;
      position: relative;
    }
    img { -webkit-user-drag: none; }
    svg { display: inline-block; vertical-align: middle; }
  </style>
</head>
<body>
  ${content}
</body>
</html>`;
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const puppeteer = require('puppeteer-core');

  console.log('Launching Chromium...');
  const browser = await puppeteer.launch({
    executablePath: CHROMIUM,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
    headless: true,
  });

  const page = await browser.newPage();

  const WIDTH = 1290;
  const HEIGHT = 2796;

  for (const screen of SCREENS) {
    console.log(`Generating: ${screen.title}...`);

    const html = generateHTML(screen, WIDTH, HEIGHT);
    await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 2 });
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    // Wait a short moment for layout
    await new Promise(r => setTimeout(r, 500));

    const filePath = path.join(OUTPUT_DIR, `ridhi-${screen.id}-6.7.png`);
    await page.screenshot({ path: filePath, type: 'png' });
    console.log(`  Saved: ${filePath}`);

    const scales = [
      { suffix: '6.5', w: 1242, h: 2688 },
      { suffix: '5.5', w: 1242, h: 2208 },
    ];

    for (const scale of scales) {
      const scaledPath = path.join(OUTPUT_DIR, `ridhi-${screen.id}-${scale.suffix}.png`);
      await page.setViewport({ width: scale.w, height: scale.h, deviceScaleFactor: 2 });
      await page.setContent(html, { waitUntil: 'domcontentloaded' });
      await new Promise(r => setTimeout(r, 500));
      await page.screenshot({ path: scaledPath, type: 'png' });
      console.log(`  Saved: ${scaledPath}`);
    }
  }

  await browser.close();

  console.log('\n=== All screenshots generated ===');
  console.log(`Location: ${OUTPUT_DIR}`);
  console.log('\nFiles:');
  const files = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.png')).sort();
  files.forEach(f => {
    const stats = fs.statSync(path.join(OUTPUT_DIR, f));
    console.log(`  ${f} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
  });
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
