'use strict'

/**
 * Schema Stitching Demo
 */

const {
  makeExecutableSchema,
  makeRemoteExecutableSchema,
  introspectSchema,
  mergeSchemas
} = require('graphql-tools')
const { HttpLink } = require('apollo-link-http')
const fetch = require('node-fetch')

const PostsServiceEndpoint = 'https://1xkw3wp89.lp.gql.zone/graphql'
const CommentsServiceEndpoint = 'https://jw34838jp.lp.gql.zone/graphql'

const createRemoteExecutableSchema = async endpoint => {
  const link = new HttpLink({ uri: endpoint, fetch })
  const schema = await introspectSchema(link)
  const executableSchema = makeRemoteExecutableSchema({
    schema,
    link
  })

  return executableSchema
}

/**
 * create edges between two remote graphql
 */
const linkTypeDefs = `
extend type Post {
  comments: [Comment]
}
extend type Comment {
  post: Post
}
`

const linkResolvers = mergeInfo => ({
  Post: {
    comments: {
      fragment: `fragment PostFragment on Post { id }`,
      resolve (post, args, context, info) {
        const postId = post.id
        return mergeInfo.delegate(
          'query',
          'commentsByPostId',
          {
            postId
          },
          context,
          info
        )
      }
    }
  },
  Comment: {
    post: {
      fragment: `fragment CommentFragment on Comment { postId }`,
      resolve (comment, args, context, info) {
        const postId = comment.postId
        return mergeInfo.delegate(
          'query',
          'post',
          {
            postId
          },
          context,
          info
        )
      }
    }
  }
})

module.exports = async () => {
  /**
   * Generate remote schema
  */
  const postsSchema = await createRemoteExecutableSchema(PostsServiceEndpoint)
  const commentsSchema = await createRemoteExecutableSchema(
    CommentsServiceEndpoint
  )

  /**
   * Merge them together
   */
  const mergedSchema = mergeSchemas({
    schemas: [postsSchema, commentsSchema, linkTypeDefs],
    resolvers: linkResolvers
  })

  return mergedSchema
}
