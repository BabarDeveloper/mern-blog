import Comment from "../models/comment.model.js";
import { errorHandler } from "../utils/error.js";

export const createComment = async (req, res, next) => {
  try {
    const { content, postId, userId } = req.body;
    if (userId !== req.user.id) {
      return next(
        errorHandler(403, "You are not allowed to create this comment")
      );
    }
    const newComment = new Comment({
      content,
      postId,
      userId,
    });
    await newComment.save();

    res.status(200).json(newComment);
  } catch (error) {
    next(error);
  }
};

export const getPostComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId }).sort({
      createdAt: -1,
    });
    res.status(200).json(comments);
  } catch (error) {
    next(error);
  }
};

export const likeComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return next(errorHandler(404, "Comment not found"));
    }
    const userIndex = comment.likes.indexOf(req.user.id);
    if (userIndex === -1) {
      comment.numberOfLikes += 1;
      comment.likes.push(req.user.id);
    } else {
      comment.numberOfLikes -= 1;
      comment.likes.splice(userIndex, 1);
    }
    await comment.save();
    res.status(200).json(comment);
  } catch (error) {
    next(error);
  }
};

export const editComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return next(errorHandler(404, "Comment not found"));
    }
    if (comment.userId !== req.user.id && !req.user.isAdmin) {
      return next(
        errorHandler(403, "You are not allowed to edit this comment")
      );
    }
    const editedComment = await Comment.findByIdAndUpdate(
      req.params.commentId,
      {
        content: req.body.content,
      },
      { new: true }
    );
    res.status(200).json(editedComment);
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return next(errorHandler(404, "Comment not found"));
    }
    if (comment.userId !== req.user.id && !req.user.isAdmin) {
      return next(
        errorHandler(403, "You are not allowed to delete this comment")
      );
    }
    await Comment.findByIdAndDelete(req.params.commentId);
    res.status(200).json("Comment has been deleted");
  } catch (error) {
    next(error);
  }
};

export const getcomments = async (req, res, next) => {
  try {
    // 1. Authentication & Authorization Check
    if (!req.user.isAdmin) {
      return next(errorHandler(403, "Only admin can access all comments"));
    }

    // 2. Input Validation & Sanitization
    const startIndex = Math.max(0, parseInt(req.query.startIndex)) || 0;
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit))) || 9;
    const sortDirection = req.query.sort === "desc" ? -1 : 1;

    // 3. Calculate date range for last month's comments
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    // 4. Parallel Database Queries
    const [comments, totalComments, lastMonthComments] = await Promise.all([
      Comment.find()
        .sort({ createdAt: sortDirection })
        .skip(startIndex)
        .limit(limit)
        .lean(),  // Convert to plain JS objects
      Comment.countDocuments(),
      Comment.countDocuments({
        createdAt: { $gte: oneMonthAgo }
      })
    ]);

    // 5. Response Formatting
    res.status(200).json({
      success: true,
      comments,
      pagination: {
        total: totalComments,
        returned: comments.length,
        limit,
        startIndex,
        nextStart: startIndex + limit < totalComments ? startIndex + limit : null
      },
      analytics: {
        lastMonth: lastMonthComments,
        percentageChange: totalComments > 0 
          ? ((lastMonthComments / totalComments) * 100).toFixed(2)
          : 0
      }
    });

  } catch (error) {
    // 6. Error Handling
    console.error(`[${new Date().toISOString()}] Comment fetch error:`, error);
    next(errorHandler(500, "Internal server error while fetching comments"));
  }
};
