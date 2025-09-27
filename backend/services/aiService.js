const axios = require('axios');
const moment = require('moment-timezone');

class AISchedulingService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.baseUrl = 'https://api.gemini.ai/v1';  // Replace with actual Gemini API base URL
    this.model = process.env.GEMINI_MODEL || 'gemini-large';
    this.maxTokens = parseInt(process.env.GEMINI_MAX_TOKENS) || 2000;
  }

  /**
   * Generate optimized schedule using Gemini AI
   * @param {Object} businessData - Business info and constraints
   * @param {Array} staffData - Staff availability and preferences
   * @param {Object} requirements - Scheduling requirements
   * @returns {Object} AI generated schedule with recommendations
   */
  async generateSchedule(businessData, staffData, requirements) {
    try {
      const prompt = this.buildSchedulingPrompt(businessData, staffData, requirements);

      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: this.model,
          messages: [
            {
              role: 'system',
              content: this.getSystemPrompt()
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: this.maxTokens,
          temperature: 0.3,
          response_format: 'json'
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          }
        }
      );

      const data = response.data;

      // Assuming response JSON has same structure with choices and message content
      const aiMessage = data.choices[0].message.content;

      const aiResponse = JSON.parse(aiMessage);

      return {
        success: true,
        schedule: aiResponse.schedule,
        recommendations: aiResponse.recommendations || [],
        warnings: aiResponse.warnings || [],
        metrics: aiResponse.metrics || {},
        reasoning: aiResponse.reasoning || ''
      };
    } catch (error) {
      console.error('Gemini AI Scheduling error:', error);
      return {
        success: false,
        error: error.message,
        fallback: this.generateFallbackSchedule(businessData, staffData, requirements)
      };
    }
  }

  // Same prompt building and helper methods as before...

  buildSchedulingPrompt(businessData, staffData, requirements) {
    const { business, businessHours, roles, constraints } = businessData;
    const weekStart = moment(requirements.weekStartDate).format('YYYY-MM-DD');
    const weekEnd = moment(requirements.weekEndDate).format('YYYY-MM-DD');

    return `
You are an expert workforce scheduling assistant.

Business: ${business.name}
Timezone: ${business.timezone}
Week: ${weekStart} to ${weekEnd}

Business hours:
${Object.entries(businessHours).map(([day, info]) => `${day}: ${info.isOpen ? info.start + '-' + info.end : 'Closed'}`).join('\n')}

Roles:
${roles.map(r => `${r.name}, min: ${r.minStaffRequired}, max: ${r.maxStaffRequired}, rate: $${r.hourlyRate || 15}/hr`).join('\n')}

Constraints:
Max hours/day: ${constraints.maxHours}
Max hours/week: ${constraints.maxHoursWeek}
Min break (minutes): ${constraints.minBreakTime}

Staff:
${staffData.map(s => `
- ${s.name} (Roles: ${s.roles.join(', ')}) availability:
${Object.entries(s.availability).map(([day, av]) => `${day}: ${av.isAvailable ? av.timeSlots.map(t => t.start + '-' + t.end).join(', ') : 'None'}`).join('\n')}
`).join('\n')}

Please generate a JSON array of shifts respecting constraints, and provide reasoning and recommendations.
    `.trim();
  }

  getSystemPrompt() {
    return `
You are a professional scheduling AI assistant. Ensure constraints and fairness.
Respond only with valid JSON containing 'schedule', 'recommendations', 'warnings', 'reasoning'.
    `.trim();
  }

  generateFallbackSchedule(businessData, staffData, requirements) {
    // Same simple fallback as before
    const schedule = [];
    // ...
    return {
      schedule, 
      recommendations: ['Fallback schedule generated. Review required.'],
      warnings: ['AI currently unavailable.']
    };
  }
}

module.exports = new AISchedulingService();
