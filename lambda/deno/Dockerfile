FROM hayd/deno-lambda:1.32.5
 
COPY index.ts ./
RUN deno cache index.ts

CMD ["index.handler"]