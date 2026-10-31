import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Photo from '../models/Photo.js';
import Album from '../models/Album.js';
import Story from '../models/Story.js';
import Highlight from '../models/Highlight.js';
import Puzzle from '../models/Puzzle.js';
import MemoryBox from '../models/MemoryBox.js';
import Report from '../models/Report.js';
import Category from '../models/Category.js';
import SiteSetting from '../models/SiteSetting.js';
import ActivityLog from '../models/ActivityLog.js';

dotenv.config();

export const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/photogallery';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
    console.log('🌱 Checking and seeding initial database records...');

    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log(`Database already populated (${userCount} users found).`);
      return;
    }

    console.log('⚡ Empty database detected. Populating comprehensive initial dataset...');

    // 1. Create Users
    const users = await User.create([
      {
        name: 'Sourhik Admin',
        email: 'superadmin@photoframe.com',
        password: 'admin123',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        bio: 'Super Admin & Lead Curator of PhotoFrame platform',
        role: 'SUPER_ADMIN',
        status: 'ACTIVE'
      },
      {
        name: 'Elena Rostova',
        email: 'admin@photoframe.com',
        password: 'admin123',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
        bio: 'Head Moderator & Community Coordinator',
        role: 'ADMIN',
        status: 'ACTIVE'
      },
      {
        name: 'Marcus Vance',
        email: 'moderator@photoframe.com',
        password: 'admin123',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        bio: 'Content reviewer and security moderator',
        role: 'MODERATOR',
        status: 'ACTIVE'
      },
      {
        name: 'Alex Morgan',
        email: 'alex@photoframe.com',
        password: 'password123',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        bio: 'Travel photographer & digital nomad capturing mountain vistas',
        role: 'USER',
        status: 'ACTIVE'
      },
      {
        name: 'Ankita Sharma',
        email: 'ankita@photoframe.com',
        password: 'password123',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
        bio: 'Visual designer, hiker, and memory maker',
        role: 'USER',
        status: 'ACTIVE'
      },
      {
        name: 'Bibek Roy',
        email: 'bibek@photoframe.com',
        password: 'password123',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
        bio: 'Landscape & tea garden wanderer',
        role: 'USER',
        status: 'ACTIVE'
      },
      {
        name: 'Arnab Sen',
        email: 'arnab@photoframe.com',
        password: 'password123',
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80',
        bio: 'Drone pilot & cinematic photographer',
        role: 'USER',
        status: 'ACTIVE'
      }
    ]);

    const superAdmin = users[0];
    const alex = users[3];
    const ankita = users[4];
    const bibek = users[5];
    const arnab = users[6];

    // 2. Categories
    const categories = await Category.create([
      { name: 'Nature', slug: 'nature', icon: 'bi-tree-fill', description: 'Breathtaking landscapes, forests, oceans, and wildlife', isFeatured: true, order: 1 },
      { name: 'Travel', slug: 'travel', icon: 'bi-airplane-fill', description: 'Wanderlust moments, global cities, and travel diaries', isFeatured: true, order: 2 },
      { name: 'Architecture', slug: 'architecture', icon: 'bi-building-fill', description: 'Monuments, modern buildings, and structural marvels', isFeatured: true, order: 3 },
      { name: 'People', slug: 'people', icon: 'bi-people-fill', description: 'Portraits, candid street photography, and human emotion', isFeatured: true, order: 4 },
      { name: 'Food', slug: 'food', icon: 'bi-cup-hot-fill', description: 'Culinary arts, delicious dishes, and café atmospheres', isFeatured: false, order: 5 },
      { name: 'Cyberpunk', slug: 'cyberpunk', icon: 'bi-lightning-charge-fill', description: 'Neon aesthetics, nocturnal city lights, and futuristic moods', isFeatured: true, order: 6 },
      { name: 'Events', slug: 'events', icon: 'bi-calendar-event-fill', description: 'Festivals, concerts, weddings, and celebrations', isFeatured: false, order: 7 },
      { name: 'Other', slug: 'other', icon: 'bi-grid-fill', description: 'Abstract art, experimental photography, and misc captures', isFeatured: false, order: 8 }
    ]);

    // 3. Photos
    const photos = await Photo.create([
      {
        title: 'Golden Hour Ocean Waves',
        description: 'Vibrant sunset over gentle rolling turquoise waves on a tropical shore.',
        category: 'Nature',
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80',
        fileSize: 1024 * 450,
        author: { userId: alex._id, name: alex.name, avatar: alex.avatar },
        tags: ['ocean', 'sunset', 'waves', 'summer'],
        likes: [ankita._id, bibek._id, superAdmin._id],
        favorites: [alex._id],
        views: 342,
        isFeatured: true,
        comments: [
          { userId: ankita._id, userName: ankita.name, userAvatar: ankita.avatar, text: 'The golden reflections on the crests are unreal!' }
        ]
      },
      {
        title: 'Misty Alpine Mountain Ridge',
        description: 'Dramatic fog winding around sharp snow-capped alpine peaks at sunrise.',
        category: 'Nature',
        imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80',
        fileSize: 1024 * 620,
        author: { userId: alex._id, name: alex.name, avatar: alex.avatar },
        tags: ['mountains', 'alpine', 'mist', 'sunrise'],
        likes: [superAdmin._id, arnab._id],
        favorites: [alex._id, ankita._id],
        views: 520,
        isFeatured: true,
        comments: [
          { userId: arnab._id, userName: arnab.name, userAvatar: arnab.avatar, text: 'Incredible atmospheric depth in this shot.' }
        ]
      },
      {
        title: 'Tokyo Neon Alleyways',
        description: 'Atmospheric rainy night reflection in the vibrant backstreets of Shinjuku.',
        category: 'Cyberpunk',
        imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=400&q=80',
        fileSize: 1024 * 510,
        author: { userId: arnab._id, name: arnab.name, avatar: arnab.avatar },
        tags: ['tokyo', 'neon', 'cyberpunk', 'night'],
        likes: [alex._id, ankita._id, bibek._id],
        favorites: [alex._id],
        views: 890,
        isFeatured: true,
        comments: [
          { userId: alex._id, userName: alex.name, userAvatar: alex.avatar, text: 'Blade runner vibes! Perfect framing.' }
        ]
      },
      {
        title: 'Venice Grand Canal Sunset',
        description: 'Classic Venetian gondolas swaying gently before the historic Santa Maria church.',
        category: 'Travel',
        imageUrl: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=1200&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=400&q=80',
        fileSize: 1024 * 390,
        author: { userId: ankita._id, name: ankita.name, avatar: ankita.avatar },
        tags: ['venice', 'italy', 'canal', 'travel'],
        likes: [bibek._id, alex._id],
        favorites: [ankita._id],
        views: 410,
        isFeatured: false,
        comments: []
      },
      {
        title: 'Futuristic Spiral Architecture',
        description: 'Geometric monochrome spiral staircase viewed from the ground looking up.',
        category: 'Architecture',
        imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80',
        fileSize: 1024 * 340,
        author: { userId: bibek._id, name: bibek.name, avatar: bibek.avatar },
        tags: ['architecture', 'geometric', 'minimal', 'modern'],
        likes: [alex._id, superAdmin._id],
        favorites: [],
        views: 290,
        isFeatured: false,
        comments: []
      },
      {
        title: 'Autumn in Kyoto Bamboo Grove',
        description: 'Sunbeams filtering through towering emerald bamboo stalks in Arashiyama.',
        category: 'Travel',
        imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=400&q=80',
        fileSize: 1024 * 580,
        author: { userId: alex._id, name: alex.name, avatar: alex.avatar },
        tags: ['kyoto', 'japan', 'bamboo', 'serene'],
        likes: [ankita._id, arnab._id, superAdmin._id],
        favorites: [alex._id],
        views: 670,
        isFeatured: true,
        comments: []
      }
    ]);

    // 4. Stories
    const now = new Date();
    const stories = await Story.create([
      {
        userId: alex._id,
        user: { name: alex.name, avatar: alex.avatar },
        mediaUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
        mediaType: 'image',
        text: 'Chasing the golden horizon today! 🌅',
        textPosition: { x: 50, y: 75 },
        textColor: '#ffffff',
        stickers: [{ emoji: '✨', x: 20, y: 30, scale: 1.5 }],
        location: 'Goa Coastal Shores',
        privacy: 'PUBLIC',
        expiresAt: new Date(Date.now() + 20 * 60 * 60 * 1000), // Active 20h
        viewers: [
          { userId: ankita._id, userName: ankita.name, userAvatar: ankita.avatar },
          { userId: superAdmin._id, userName: superAdmin.name, userAvatar: superAdmin.avatar }
        ],
        reactions: [{ userId: ankita._id, userName: ankita.name, emoji: '🔥' }],
        replies: [{ userId: ankita._id, userName: ankita.name, userAvatar: ankita.avatar, text: 'Take me with you next time!' }]
      },
      {
        userId: ankita._id,
        user: { name: ankita.name, avatar: ankita.avatar },
        mediaUrl: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80',
        mediaType: 'image',
        text: 'Morning mist in the tea estates ☕🌿',
        textPosition: { x: 50, y: 80 },
        textColor: '#f0fdf4',
        stickers: [{ emoji: '🏔️', x: 80, y: 25, scale: 1.3 }],
        location: 'Darjeeling, West Bengal',
        privacy: 'PUBLIC',
        expiresAt: new Date(Date.now() + 18 * 60 * 60 * 1000),
        viewers: [{ userId: alex._id, userName: alex.name, userAvatar: alex.avatar }],
        reactions: [{ userId: alex._id, userName: alex.name, emoji: '❤️' }],
        replies: []
      },
      {
        userId: arnab._id,
        user: { name: arnab.name, avatar: arnab.avatar },
        mediaType: 'text',
        text: 'Night shoot underway in Shinjuku! 📸 Neon reflections everywhere.',
        textPosition: { x: 50, y: 50 },
        textColor: '#ffffff',
        backgroundStyle: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
        stickers: [{ emoji: '⚡', x: 50, y: 20, scale: 1.8 }],
        location: 'Shinjuku, Tokyo',
        privacy: 'PUBLIC',
        expiresAt: new Date(Date.now() + 15 * 60 * 60 * 1000),
        viewers: [],
        reactions: [],
        replies: []
      }
    ]);

    // 5. Highlights
    await Highlight.create([
      {
        userId: alex._id,
        title: 'Mountains',
        category: 'Mountains',
        coverImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80',
        stories: [stories[0]._id]
      },
      {
        userId: alex._id,
        title: 'Travel Diaries',
        category: 'Travel',
        coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80',
        stories: [stories[0]._id]
      },
      {
        userId: ankita._id,
        title: 'Darjeeling Trip',
        category: 'Travel',
        coverImage: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=400&q=80',
        stories: [stories[1]._id]
      }
    ]);

    // 6. Photo Puzzles
    const puzzles = await Puzzle.create([
      {
        photoId: photos[0]._id,
        title: 'Golden Hour Waves 3x3 Puzzle',
        imageUrl: photos[0].imageUrl,
        creatorId: alex._id,
        creator: { name: alex.name, avatar: alex.avatar },
        difficulty: 'EASY',
        gridSize: 3,
        attempts: 24,
        completions: 18,
        bestScore: 1940,
        leaderboard: [
          { userId: ankita._id, username: ankita.name, avatar: ankita.avatar, timeSeconds: 28, moves: 22, score: 1940, completedAt: new Date(Date.now() - 3600000) },
          { userId: bibek._id, username: bibek.name, avatar: bibek.avatar, timeSeconds: 35, moves: 26, score: 1780, completedAt: new Date(Date.now() - 7200000) },
          { userId: arnab._id, username: arnab.name, avatar: arnab.avatar, timeSeconds: 42, moves: 34, score: 1610, completedAt: new Date(Date.now() - 86400000) }
        ]
      },
      {
        photoId: photos[1]._id,
        title: 'Alpine Peak Challenge 4x4',
        imageUrl: photos[1].imageUrl,
        creatorId: alex._id,
        creator: { name: alex.name, avatar: alex.avatar },
        difficulty: 'MEDIUM',
        gridSize: 4,
        attempts: 16,
        completions: 9,
        bestScore: 3620,
        leaderboard: [
          { userId: superAdmin._id, username: superAdmin.name, avatar: superAdmin.avatar, timeSeconds: 65, moves: 54, score: 3620, completedAt: new Date(Date.now() - 14400000) },
          { userId: ankita._id, username: ankita.name, avatar: ankita.avatar, timeSeconds: 88, moves: 68, score: 3150, completedAt: new Date(Date.now() - 28800000) }
        ]
      },
      {
        photoId: photos[2]._id,
        title: 'Tokyo Cyberpunk Master 6x6',
        imageUrl: photos[2].imageUrl,
        creatorId: arnab._id,
        creator: { name: arnab.name, avatar: arnab.avatar },
        difficulty: 'HARD',
        gridSize: 6,
        attempts: 12,
        completions: 4,
        bestScore: 8420,
        leaderboard: [
          { userId: alex._id, username: alex.name, avatar: alex.avatar, timeSeconds: 160, moves: 124, score: 8420, completedAt: new Date(Date.now() - 43200000) }
        ]
      }
    ]);

    // 7. Memory Boxes (Featuring "My First Darjeeling Trip" & Collaborators)
    const memoryBoxes = await MemoryBox.create([
      {
        title: 'My First Darjeeling Trip',
        location: 'Darjeeling, West Bengal',
        startDate: '12 October 2026',
        endDate: '16 October 2026',
        description: 'We had been planning this trip for months! Exploring misty pine hills, vintage heritage toy trains, and steaming momos in the queen of hills with our closest friends.',
        coverImage: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80',
        creatorId: sourhikAdminOrAlex(superAdmin, alex)._id,
        creator: {
          name: 'Sourhik Ghosh',
          avatar: superAdmin.avatar
        },
        collaborators: [
          { userId: ankita._id, name: ankita.name, email: ankita.email, avatar: ankita.avatar, role: 'EDITOR', status: 'ACCEPTED' },
          { userId: bibek._id, name: bibek.name, email: bibek.email, avatar: bibek.avatar, role: 'EDITOR', status: 'ACCEPTED' },
          { userId: arnab._id, name: arnab.name, email: arnab.email, avatar: arnab.avatar, role: 'EDITOR', status: 'ACCEPTED' }
        ],
        entries: [
          {
            title: 'Journey Started & Reaching Darjeeling',
            date: '12 October 2026',
            text: 'We reached Darjeeling early in the morning via the winding Rohini route. The weather was crisp and cold, and the breathtaking view of the hills from the hotel was amazing.',
            location: 'Darjeeling Hill Town',
            photos: [
              'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
            ],
            author: { userId: superAdmin._id, name: 'Sourhik Ghosh', avatar: superAdmin.avatar }
          },
          {
            title: 'Tiger Hill Sunrise',
            date: '13 October 2026',
            text: 'Woke up at 3:30 AM to catch the sunrise at Tiger Hill. Watching the golden sunlight crown the majestic Kanchenjunga peak was an unforgettable spiritual spectacle.',
            location: 'Tiger Hill Peak',
            photos: [
              'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80'
            ],
            author: { userId: ankita._id, name: ankita.name, avatar: ankita.avatar }
          },
          {
            title: 'Mall Road & Glenary’s Café',
            date: '14 October 2026',
            text: 'Spent the evening walking down Chowrasta Mall Road. Had hot Darjeeling tea, apple pie, and sizzlers at the iconic colonial bakery Glenary’s.',
            location: 'Chowrasta Mall Road',
            photos: [
              'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=800&q=80'
            ],
            author: { userId: bibek._id, name: bibek.name, avatar: bibek.avatar }
          },
          {
            title: 'Local Sightseeing & Tea Gardens',
            date: '15 October 2026',
            text: 'Visited the Happy Valley Tea Estate, the Peace Pagoda, and watched the heritage Steam Toy Train curl through the Batasia Loop war memorial.',
            location: 'Batasia Loop & Tea Gardens',
            photos: [
              'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80'
            ],
            author: { userId: arnab._id, name: arnab.name, avatar: arnab.avatar }
          },
          {
            title: 'Journey Home with Lifelong Memories',
            date: '16 October 2026',
            text: 'Packed our bags with authentic First Flush tea packets and souvenir woolen scarves. Said farewell to the hills with hearts full of nostalgia.',
            location: 'Darjeeling Railway Station',
            photos: [
              'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80'
            ],
            author: { userId: superAdmin._id, name: 'Sourhik Ghosh', avatar: superAdmin.avatar }
          }
        ],
        photos: [
          'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80'
        ],
        privacy: 'PUBLIC',
        likes: [alex._id, ankita._id, bibek._id, arnab._id],
        views: 840,
        isFeatured: true,
        comments: [
          { userId: alex._id, name: alex.name, avatar: alex.avatar, text: 'This travelogue is beautifully documented! Bringing back so many mountain memories.' }
        ]
      },
      {
        title: 'Kyoto Autumn Chronicles',
        location: 'Kyoto, Japan',
        startDate: '5 November 2026',
        endDate: '12 November 2026',
        description: 'Chasing the vivid red momiji maple leaves through historic zen gardens, Arashiyama bamboo forests, and tranquil shrines.',
        coverImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
        creatorId: alex._id,
        creator: { name: alex.name, avatar: alex.avatar },
        collaborators: [],
        entries: [
          {
            title: 'Arriving in the Ancient Capital',
            date: '5 November 2026',
            text: 'Stepped off the Shinkansen into the crisp autumn breeze of Kyoto.',
            location: 'Gion District',
            photos: ['https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80'],
            author: { userId: alex._id, name: alex.name, avatar: alex.avatar }
          }
        ],
        photos: ['https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80'],
        privacy: 'PUBLIC',
        likes: [superAdmin._id, ankita._id],
        views: 420,
        isFeatured: true
      }
    ]);

    // 8. Albums
    await Album.create([
      {
        title: 'Alpine & Coastal Serenity',
        description: 'A handpicked compilation of scenic landscapes from our travel series.',
        coverImage: photos[0].imageUrl,
        author: { userId: alex._id, name: alex.name, avatar: alex.avatar },
        photos: [photos[0]._id, photos[1]._id, photos[5]._id],
        isPrivate: false,
        isFeatured: true
      },
      {
        title: 'Urban Cyberpunk Tokyo',
        description: 'Night streets, neon glow, and architectural symmetry in Japan.',
        coverImage: photos[2].imageUrl,
        author: { userId: arnab._id, name: arnab.name, avatar: arnab.avatar },
        photos: [photos[2]._id, photos[4]._id],
        isPrivate: false,
        isFeatured: false
      }
    ]);

    // 9. Reports
    await Report.create([
      {
        reporterId: ankita._id,
        reporter: { name: ankita.name, email: ankita.email },
        itemType: 'PHOTO',
        itemId: photos[3]._id.toString(),
        itemTitle: photos[3].title,
        itemPreview: photos[3].imageUrl,
        reason: 'Misleading Information',
        details: 'Location tag could be verified more accurately for historical clarity.',
        status: 'PENDING'
      }
    ]);

    // 10. Site Settings
    await SiteSetting.create({
      siteName: 'PhotoFrame',
      siteTagline: 'Discover & Share Extraordinary Moments',
      uploadLimitMB: 50,
      allowedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4'],
      videoLimitsMB: 100,
      storyExpiryHours: 24,
      commentsEnabled: true,
      registrationOpen: true,
      maintenanceMode: false,
      defaultPrivacy: 'PUBLIC',
      storageLimitMB: 5120,
      featuredPhotos: [photos[0]._id, photos[1]._id, photos[2]._id],
      featuredMemoryBoxes: [memoryBoxes[0]._id],
      featuredPuzzles: [puzzles[0]._id, puzzles[1]._id],
      featuredCreators: [superAdmin._id, alex._id, ankita._id]
    });

    // 11. Activity Log
    await ActivityLog.create({
      adminId: superAdmin._id,
      adminName: superAdmin.name,
      adminEmail: superAdmin.email,
      action: 'SYSTEM_INITIALIZATION',
      targetType: 'SYSTEM',
      details: 'Initial database seeds and core platform structures provisioned successfully.'
    });

    console.log('✅ Database seeded successfully with all models, users, stories, puzzles, memory boxes, and moderation items.');
  } catch (error) {
    console.error('Database seeding error:', error);
  }
};

function sourhikAdminOrAlex(admin, alex) {
  return admin || alex;
}

if (process.argv[2] === '--run') {
  seedDatabase().then(() => {
    console.log('Seeder complete.');
    process.exit(0);
  });
}
