import { createAction, handleActions } from 'redux-actions';
import createRequestSaga, {
    createRequestActionTypes,
} from '../lib/createRequestSaga';
import * as postsAPI from '../lib/api/posts';
import { takeLatest } from 'redux-saga/effects';

//write 리덕스 모듈

const INITIALIZE = 'write/INITIALIZE'; // 모든 내용 초기화 
const CHANGE_FIELD = 'write/CHANGE_FIELD'; // 특정 key 값 바꾸기
const [
    WRITE_POST,
    WRITE_POST_SUCCESS,
    WRITE_POST_FAILURE,
] = createRequestActionTypes('write/WRITE_POST');

export const initialize = createAction(INITIALIZE);
export const changeField = createAction(CHANGE_FIELD, ({ key, value}) => ({
    key,
    value
}));
export const writePost = createAction(WRITE_POST, ({ title, body, tags}) => ({
    title,
    body,
    tags,
}));

// 사가 생성
const writePostSaga = createRequestSaga(WRITE_POST, postsAPI.writePost);
export function* writeSaga() {
    yield takeLatest(WRITE_POST, writePostSaga);
}


// export const changeField = text => ({
//   type: CHANGE_FIELD,
//   write: {
//     key,
//     value,
//   }
// });

const initialState = {
    title: '',
    body: '',
    tags: [],
    post: null,
    postError: null,
};

const write = handleActions({
    [INITIALIZE]: state => initialState, // initialState를 넣으면 초기상태로 바뀜 
    [CHANGE_FIELD]: (state, { payload: { key, value } }) => ({ //비구조화 할당으로 payload가 어느값을 가리키는지 표시
        ...state,
        [key]: value, // 특정 key 값 업데이트
    }),
    [WRITE_POST]: state => ({
        ...state,
        // post 와 postError를 초기호ㅓㅏ
        post: null,
        postError: null
    }),
    //포스트 작성 성공
    [WRITE_POST_SUCCESS]: (state, { payload: post}) => ({
        ...state,
        post
    }),
    //포스트 작성 실패
    [WRITE_POST_FAILURE]: (state, {payload: postError}) => ({
        ...state,
        postError
    })

}, initialState);

export default write;