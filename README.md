This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
pnpm dev
```

Then run Convex development mode:

```bash
npx convex dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## All Dependencies
- pnpm i @radix-ui/react-icons

<!-- LangChain -->
- pnpm add langchain
- pnpm add @langchain/core
- pnpm add @langchain/langgraph
- pnpm add @langchain/anthropic (For using Claude)
- pnpm add @langchain/openai (This also supports Azure OpenAI)
- pnpm add @wxflows/sdk@beta

## Tutorial steps

1. 执行命令 `pnpm dlx create-next-app@latest ai-agent`
2. 注册 [Clerk](https://dashboard.clerk.com/apps/app_2sNOLkttZTuh7CWXHhSbgEBbF2w/instances/ins_2sNOLu1SrvXhrAT0tZfkXX6Ddfh)
3. 
