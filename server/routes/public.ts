import { Router } from 'express';
import { getDB } from '../config/database.js';

const router = Router();

// Get public game information
router.get('/game-info', async (req, res, next) => {
  try {
    // Return static game information for now
    // In a real implementation, this could come from a CMS or database
    const gameInfo = {
      title: "My Last Wish",
      tagline: "A dark narrative-driven action game",
      description: "Experience the haunting journey of Sophie, a contract killer whose perception of reality shifts as she grapples with trauma and seeks redemption.",
      features: [
        "Unique color-based vision system representing mental state",
        "Dynamic narrative that adapts to your choices",
        "Stealth or combat gameplay paths",
        "Hidden morale system affecting story outcomes",
        "Stunning animated cutscenes and manga-style panels",
        "Deep exploration of trauma, perception, and redemption"
      ],
      screenshots: [
        "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg",
        "https://images.pexels.com/photos/1174952/pexels-photo-1174952.jpeg",
        "https://images.pexels.com/photos/1591447/pexels-photo-1591447.jpeg"
      ],
      trailer: "https://www.youtube.com/embed/dQw4w9WgXcQ" // Placeholder
    };

    res.json(gameInfo);
  } catch (error) {
    next(error);
  }
});

// Get company information
router.get('/company-info', async (req, res, next) => {
  try {
    const companyInfo = {
      name: "MuseFuze Studios",
      mission: "Creating immersive narrative experiences that challenge perception and explore the depths of human emotion.",
      values: [
        "Innovation in storytelling through interactive media",
        "Authentic exploration of complex psychological themes",
        "Quality craftsmanship in every aspect of game development",
        "Community-driven development and feedback integration"
      ],
      team: {
        size: "12+ passionate developers, artists, and storytellers",
        founded: "2023",
        location: "Global remote team"
      }
    };

    res.json(companyInfo);
  } catch (error) {
    next(error);
  }
});

export default router;