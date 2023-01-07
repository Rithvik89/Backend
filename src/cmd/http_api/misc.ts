import { HerrorStatus } from "../../pkg/herror/status_codes";
import { Herror } from "../../pkg/herror/herror";
import RouteHandler from "./types";
import { resolve } from "path";


export const HandlePostFeedback: RouteHandler = async (

  req,
  res,
  next,
  app
) => {
  const user_id: number = Number(req.context.user_id);
  const content: string = String(req.body.content);

  let image_buffer: Buffer | undefined = undefined;
  if (req.file && req.file.buffer) image_buffer = req.file.buffer;

  try {
    const { responseStatus } = await app.miscManager.receiveFeedback(
      user_id,
      content,
      image_buffer
    );
    app.SendRes(res, {
      status: responseStatus.statusCode,
      message: responseStatus.message,
    });
  } catch (err) {
    next(new Herror("BadRequest", HerrorStatus.StatusBadRequest));
  }
};

export const HandleGetPolls: RouteHandler = async (req, res, next, app) => {
  const poll_id = req.body.poll_id;
  const limit = Number(req.query.limit || 1);
  const offset = Number(req.query.offset || 0);

  if (poll_id != undefined) {
    const poll_data = await app.miscManager.GetPolls(limit, offset);
    app.SendRes(res, {
      status: 200,
      data: poll_data,
    });
  } else {
    next(new Herror("BadRequest", HerrorStatus.StatusBadRequest));
  }
};

export const HandlePostPolls: RouteHandler = async (req, res, next, app) => {
  const poll_id = req.body.poll_id;
  const user_id = req.context.user_id;
  const type = req.body.type;
  try {
    await app.miscManager.PostPollReactions(poll_id, user_id, type);
    app.SendRes(res, {
      status: 200,
    });
  } catch (err) {
    next(err);
  }
};
