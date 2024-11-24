import { Context, Schema } from "koishi";

export const name = "milk-altsender";
export const inject = ["database"];

export interface Config {}

export const Config: Schema<Config> = Schema.object({});

export interface Credential {
  id?: number;
  createdAt: Date;
  content: string;
}

declare module "koishi" {
  interface Tables {
    "milk-altsender-credentials": Credential;
  }
}

export function apply(ctx: Context) {
  ctx.database.extend(
    "milk-altsender-credentials",
    {
      id: "unsigned",
      createdAt: "timestamp",
      content: "text",
    },
    { autoInc: true }
  );

  ctx
    .command("getalt", "获取一个 Minecraft 账号", {})
    .action(async ({ session }) => {
      const credential = await ctx.database
        .select("milk-altsender-credentials")
        .limit(1)
        .execute();
      if (!credential || !credential.length) {
        return "没有账号了";
      }
      await ctx.database.remove("milk-altsender-credentials", {
        id: credential[0].id,
      });
      return (
        <>
          账号：{credential[0].content}
          <br />
          添加时间：{credential[0].createdAt.toLocaleString()}
        </>
      );
    });

  ctx
    .command("addalt <content:text>", "添加一个 Minecraft 账号", {
      authority: 4,
    })
    .action(async ({ session }, content) => {
      await ctx.database.create("milk-altsender-credentials", {
        content,
        createdAt: new Date(),
      });
      return "添加成功";
    });
}
