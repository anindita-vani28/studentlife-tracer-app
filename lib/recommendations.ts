import { Task } from './supabase/database'
import { WeatherData } from './weather'

export type StudyRecommendation = {
  subject: string
  duration: number // minutes
  reason: string
  difficulty: 'easy' | 'medium' | 'hard'
  priority: 'high' | 'medium' | 'low'
}

export type DailyRecommendations = {
  mood: string
  weather: string
  temperature: number
  recommendations: StudyRecommendation[]
  dailyMessage: string
  totalStudyTime: number // minutes
}

// Calculate study recommendation based on mood + weather + workload
export function generateRecommendations(
  mood: string,
  energyLevel: number | null,
  stressLevel: number | null,
  weather: WeatherData | null,
  upcomingTasks: Task[],
  totalAvailableTime: number = 240 // minutes per day
): DailyRecommendations {
  const recommendations: StudyRecommendation[] = []

  // Filter urgent tasks (due within 48 hours)
  const urgentTasks = upcomingTasks.filter(task => {
    const daysUntilDue = (new Date(task.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    return daysUntilDue <= 2
  })

  // Filter upcoming tasks (due within 7 days)
  const upcomingTasks7Days = upcomingTasks.filter(task => {
    const daysUntilDue = (new Date(task.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    return daysUntilDue <= 7 && daysUntilDue > 2
  })

  // Determine study intensity based on mood
  let studyIntensity = 'moderate'
  let sessionDuration = 60
  let recommendedBreaks = 15

  if (mood === 'energetic' || mood === 'motivated') {
    studyIntensity = 'high'
    sessionDuration = 90
    recommendedBreaks = 15
  } else if (mood === 'tired' || mood === 'overwhelmed') {
    studyIntensity = 'low'
    sessionDuration = 30
    recommendedBreaks = 10
  } else if (mood === 'stressed' || mood === 'distracted') {
    studyIntensity = 'medium'
    sessionDuration = 45
    recommendedBreaks = 12
  } else if (mood === 'focused') {
    studyIntensity = 'high'
    sessionDuration = 120
    recommendedBreaks = 20
  }

  // Adjust for weather
  let weatherFactor = 1
  let weatherRecommendation = ''

  if (weather) {
    if (weather.isRaining || weather.isStormy) {
      weatherRecommendation = 'It\'s rainy/stormy - perfect for indoor focused study'
      weatherFactor = 1.2 // Good for studying indoors
      if (mood === 'energetic') {
        sessionDuration = Math.min(sessionDuration + 30, 150)
      }
    } else if (weather.isCloudy) {
      weatherRecommendation = 'It\'s cloudy - good study weather'
      weatherFactor = 1.1
    } else {
      weatherRecommendation = `It's ${weather.temperature}°F and sunny - consider studying outdoors or take breaks outside`
      weatherFactor = 0.9 // Might want to be outside
    }
  }

  // Create recommendations for urgent tasks
  for (const task of urgentTasks) {
    const daysLeft = Math.ceil((new Date(task.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    const priority = daysLeft <= 1 ? 'high' : 'high'
    let duration = task.difficulty === 'hard' ? 120 : task.difficulty === 'medium' ? 75 : 45

    // Adjust duration based on mood
    if (mood === 'tired' || mood === 'overwhelmed') {
      duration = Math.ceil(duration * 0.6)
    }

    recommendations.push({
      subject: task.title,
      duration,
      reason: `Due in ${daysLeft} day${daysLeft !== 1 ? 's' : ''} - URGENT`,
      difficulty: task.difficulty,
      priority,
    })
  }

  // Add recommendations for upcoming tasks if time permits
  let usedTime = recommendations.reduce((sum, r) => sum + r.duration + 15, 0)
  for (const task of upcomingTasks7Days) {
    if (usedTime >= totalAvailableTime * 0.7) break

    const daysLeft = Math.ceil((new Date(task.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    let duration = task.difficulty === 'hard' ? 90 : task.difficulty === 'medium' ? 60 : 30

    if (mood === 'tired' || mood === 'overwhelmed') {
      duration = Math.ceil(duration * 0.5)
    }

    recommendations.push({
      subject: task.title,
      duration,
      reason: `Due in ${daysLeft} days`,
      difficulty: task.difficulty,
      priority: daysLeft <= 3 ? 'high' : 'medium',
    })

    usedTime += duration + 15
  }

  // Sort by priority and difficulty
  recommendations.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    const difficultyOrder = { hard: 0, medium: 1, easy: 2 }

    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    }
    return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
  })

  // Generate daily message
  let dailyMessage = generateDailyMessage(mood, energyLevel, stressLevel, weather, recommendations.length)

  const totalStudyTime = recommendations.reduce((sum, r) => sum + r.duration, 0)

  return {
    mood,
    weather: weather ? `${weather.condition}, ${Math.round(weather.temperature)}°F` : 'Unknown',
    temperature: weather?.temperature || 0,
    recommendations: recommendations.slice(0, 5), // Top 5 recommendations
    dailyMessage,
    totalStudyTime,
  }
}

// Generate personalized daily message
function generateDailyMessage(
  mood: string,
  energy: number | null,
  stress: number | null,
  weather: WeatherData | null,
  taskCount: number
): string {
  let message = ''

  if (mood === 'energetic' || mood === 'motivated') {
    message = '🔋 You\'re full of energy today! This is a great time to tackle those hard problems.'
  } else if (mood === 'focused') {
    message = '🎯 You\'re in the zone! Maximize this focused time on your most important tasks.'
  } else if (mood === 'tired') {
    message = '😴 You seem tired. Let\'s focus on lighter tasks and take frequent breaks.'
  } else if (mood === 'stressed') {
    message = '😰 You\'re feeling stressed. Breaking tasks into smaller chunks might help.'
  } else if (mood === 'distracted') {
    message = '🙃 Staying focused might be tough today. Try short sessions with clear breaks.'
  } else if (mood === 'overwhelmed') {
    message = '😵 Feeling overwhelmed? Start with just ONE small task to build momentum.'
  } else {
    message = '👋 Good morning! Let\'s make today productive.'
  }

  // Add weather note
  if (weather) {
    if (weather.isRaining || weather.isStormy) {
      message += ' ☔ The rainy weather is perfect for focused indoor study!'
    } else if (weather.isCloudy) {
      message += ' ☁️ Nice study weather today.'
    } else if (weather.temperature > 85) {
      message += ` ☀️ It's hot outside - stay hydrated while studying!`
    }
  }

  if (taskCount === 0) {
    message += ' ✨ No urgent tasks today - great time for review or exploring new topics!'
  } else if (taskCount <= 2) {
    message += ` You have ${taskCount} urgent task${taskCount !== 1 ? 's' : ''} to focus on.`
  } else {
    message += ` You have ${taskCount} tasks to prioritize. Let's start with the most urgent.`
  }

  return message
}
