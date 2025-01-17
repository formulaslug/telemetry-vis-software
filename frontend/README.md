This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Arrow-js

Some notes about the [arrow-js library](https://arrow.apache.org/docs/js/):

- they somewhat recently underwent a major API change / rewrite / simplification
  through versions 7/8/9. However, most guides on the internet are still written
  for the old syntax and the documentation of new versions is bad at best. See
  [this upgrade guide](https://arrow.apache.org/docs/js/classes/Arrow_dom.Table.html#concat)
  and
- if you're curious how the DataRow schema thing and generic type parameter
  works, this is the [arrow-js
  PR](https://github.com/apache/arrow/commit/8e2248273a309a2a5a3c4c6328421ae7c3aa451e)
  that introduced that capability
- [parquet-wasm](https://github.com/kylebarron/parquet-wasm) (and maybe
  [arrow-js-ffi](https://github.com/kylebarron/arrow-js-ffi)) seem like
  promising ways to deal with actual Parquet data in the browser (not just
  arrow)
- in the future: if we ever try out Perspective,
  [this](https://github.com/finos/perspective/issues/929) looks promising in
  terms of passing data over.
