import { Router, type IRouter } from "express";
import { db, ifrsMetricsInterestTable } from "@workspace/db";
import {
  SubmitIfrsMetricsInterestBody,
  SubmitIfrsMetricsInterestResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/ifrs-metrics/interest", async (req, res): Promise<void> => {
  const email =
    typeof req.body?.email === "string" ? req.body.email.trim() : req.body?.email;
  const parsed = SubmitIfrsMetricsInterestBody.safeParse({
    ...req.body,
    email,
  });

  if (!parsed.success) {
    res.status(400).json({ error: "Enter a valid email and confirm consent." });
    return;
  }

  if (
    parsed.data.standards &&
    new Set(parsed.data.standards).size !== parsed.data.standards.length
  ) {
    res.status(400).json({ error: "Choose each standard no more than once." });
    return;
  }

  const normalizedEmail = parsed.data.email.toLowerCase();
  const standards = parsed.data.standards ?? [];
  const [created] = await db
    .insert(ifrsMetricsInterestTable)
    .values({ email: normalizedEmail, standards })
    .onConflictDoNothing()
    .returning({ id: ifrsMetricsInterestTable.id });

  const alreadyRegistered = !created;
  const response = SubmitIfrsMetricsInterestResponse.parse({
    message: alreadyRegistered
      ? "This email is already registered for updates."
      : "Thanks for your interest in IFRS Lab.",
    alreadyRegistered,
  });

  res.status(alreadyRegistered ? 200 : 201).json(response);
});

export default router;
