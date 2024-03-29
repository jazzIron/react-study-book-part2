  
import Post from '../../models/post';
import mongoose from 'mongoose';
import Joi from 'joi';

const winston = require('winston');
const logger = winston.createLogger();

const { ObjectId } = mongoose.Types;

export const getPostById = async (ctx, next) => {
    const { id } = ctx.params;
    if ( !ObjectId.isValid(id)) {
        ctx.status = 400;
        return;
    }
    try {
        const post = await Post.findById(id);
        if (!post) {
            ctx.status = 404;
            return;
        }
        ctx.state.post = post;
        return next();
    } catch (e) {
        ctx.throw(500, e);
    }
};

/**로그인 중인 사용자 확인 */
export const checkOwnPost = (ctx, next) => {
    const { user, post } = ctx.state;
    if (post.user._id.toString() !== user._id) {
        ctx.status = 403;
        return;
    }
    return next();
};

/*
    POST /api/posts
    {
        title: '제목',
        body: '내용',
        tags: ['태그1', '태그2']
    }
*/

export const write = async ctx => {

    const schema = Joi.object().keys({
        title: Joi.string().required(), //required()가 있으면 필수 항목
        body: Joi.string().required(),
        tags: Joi.array()
            .items(Joi.string())
            .required()
    });

    const result = schema.validate(ctx.request.body);
    if (result.error) {
        ctx.status = 400;
        ctx.body = result.error;
        return;
    }

    const { title, body, tags } = ctx.request.body;
    const post = new Post({
        title,
        body,
        tags,
        user: ctx.state.user,
    });
    try {
        await post.save();
        ctx.body = post;
    } catch(e){
        ctx.throw(500, e);
    }
};

/**
    GET /api/posts
 */
export const list = async ctx => {

    //query는 문자열이기 때문에 숫자로 변환 필요
    // 값이 주어지지 않았다면 1을 기본으로 사용

    const page = parseInt(ctx.query.page || '1', 10);
    if(page < 1){
        ctx.status = 400;
        return;
    }

    //tag, username 값이 유효하면 객체 안에 넣고, 그렇지 않으면 넣지 않음
    const { tag, username } = ctx.query;
    const query = {
        ...(username ? { 'user.username' : username} : {}),
        ...(tag ? { tags : tag } : {}),
    };

    try {
        const posts = await Post.find(query)
        .sort({ _id: -1 })
        .limit(10)
        .skip((page - 1) * 10)
        .lean() //처음부터 JSON 형태로 데이터 조회 ( = .map(post => post.toJSON()))
        .exec();
        const postCount = await Post.countDocuments(query).exec();
        ctx.set('Last-Page', Math.ceil(postCount / 10));
        ctx.body = posts
            .map(post => ({
                ...post,
                body:
                    post.body.length < 200 ? post.body : `${post.body.slice(0, 200)}...`,
            }));
    } catch (error) {
        ctx.throw(500, error);
    }
};

/**
    GET /api/posts/:id
 */
export const read = async ctx => {
    ctx.body = ctx.state.post;
};

/**
    DELETE /api/posts/:id
 */
 export const remove = async ctx => {
     const { id } = ctx.params;
     logger.info('you come in path to '/'id' );
     try {
         await Post.findByIdAndRemove(id).exec();
         ctx.status = 204;  // No Content 성공하기는 했지만 응답할 데이터는 없음
     } catch (e) {
         ctx.throw(500, e);
     }
 };


/**
    PATCH /pai/posts/:id
    {
        title: '수정',
        body: '수정 내용',
        tags: ['수정, '태그']
    }
 */
 export const update = async ctx => {
     const { id } = ctx.params;

    const schema = Joi.object().keys({
        title: Joi.string(),
        body: Joi.string(),
        tags: Joi.array().items(Joi.string())
    });

    const result = schema.validate(ctx.request.body);
    if (result.error) {
        ctx.status = 400;
        ctx.body = result.error;
        return;
    }

    try {
        const post = await Post.findByIdAndUpdate(id, ctx.request.body, {
            new: true, // 이 값을 설정하면 업데이트된 데이터를 반환합니다.
            // false일 때는 업데이트되기 전의 데이터를 반환합니다.
        }).exec();
        if (!post) {
            ctx.status = 404;
            return;
        }
        ctx.body;
    } catch (e) {
        ctx.throw(500, e);
    }
 };

