import React from 'react';
import HeaderContainer from '../components/common/HeaderContainer';
import PostList from '../components/post/PostList';

const PostListPage = () =>{
    return (
        <div>
            <HeaderContainer />
            <PostList />
        </div>
    );
};

export default PostListPage;