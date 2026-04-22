import cron from "node-cron";
import { getDueFollowUps } from "../services/followup.service.js";
import { sendEmail } from "../services/notification.service.js";
import { User } from "../models/User.js";

// Runs every 5 minutes
export function startFollowUpJob() {
  cron.schedule("*/5 * * * *", async () => {
    const due = await getDueFollowUps();
    for (const f of due) {
      const agent = await User.findByPk(f.agentId);
      if (agent) {
        await sendEmail(
          agent.email,
          "Follow-up Reminder",
          `<p>You have a follow-up due: <strong>${f.note}</strong></p>`
        );
      }
    }
    console.log(`Follow-up job: notified ${due.length} agents`);
  });
}
