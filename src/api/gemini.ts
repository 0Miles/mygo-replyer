import { ref } from 'vue'
import { useConfigManager } from '../utils/config-manager'
import { geminiModels } from '../utils/gemini-models'

export function useGemini() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const configManager = useConfigManager()

  // 加載提示詞
  const loadPrompt = (): string => {
    return `你是一個訊息分析師，考慮訊息情境並分析讀到訊息內容的人可能有的情緒後，從規定的固定回覆內容中挑選最適合用來與原訊息對話的回覆內容
規定的固定回覆內容：['真不敢相信', '我也一樣', '因為我很想要嘛', '每次想著想著就會感到很厭世', '妳誤會了', '我想應該不是', '這算什麼', '真是太對了', '妳不僅表裡不一，又滿口謊言', '差勁', '也沒有啦', '妳是來找我吵架的嗎', '我沒有那麼厲害啦', '妳在開玩笑嗎', '為什麼不行', '是沒錯啊', '又來了一個新人', '是一輩子喔 一輩子', '我懂', '不要逃啦', '謝謝妳', '這個不用了', '好可愛喔', '這傢伙根本什麼也不懂', '讓我們一起迷失吧', '那真是可喜可賀', '一輩子跟我一起組樂團嗎', '原來妳是這麼想的呀', '為什麼都不回答我啊', '我有啊', '我不會再演奏春日影了', '妳到底是怎樣啊', '愛音驚訝', '愛音:蛤', '好厲害', '怎麼會...簡直不敢相信', '立希看手機', '滿腦子都只想到自己呢', '來，開始溝通吧', '我考慮一下吧', '是嗎', '我願意一輩子和燈在一起', '不錯吧', '爽世大小眼', '我都說了討厭了吧', '只要是我能做的，我什麼都願意做', '我都會全力以赴的', '妳要不要先去洗澡', '爽世：別這樣啦', '祥子：是這樣嗎', '這是在報復我嗎', '那...那我呢', '抱歉', '聽起來好棒喔', '我不參加', '我完全不懂妳的意思', '就由我來將它結束掉', '為什麼要演奏春日影', '什麼意思', '我沒說過那種話', '不讓我們看看我們怎麼知道', '我愛慕虛榮啦', '不行', '真的嗎', '味道醇香，我很喜歡', '感謝您讓我佔用的寶貴時間', '太過分了', '我都說一直有在看了啊', '這樣啊', '喵夢：別這樣啦', '真的很莫名其妙', '交給我吧', '她是我朋友', '我的人生已經失敗了吧', '因為春日影是一首好歌', '真的毫無品味', '好厲害...', '愛音模糊', '不是這樣的', '好硬派', '我已經搞不懂了', '不爽世', '真的是很不容易呢', '找不到耶', '妳怎麼會這麼想', '是又怎樣', '所以我才受不了大人', '能否請妳積極考慮我的提案呢', '我要', '在這裡想叫都沒問題', '不要講這種話', '沒有人那樣拜託妳', '現在沒時間玩了吧', '立希：蛤', '這樣很沒有教養喔', '睦：是這樣嗎', '愛音泡澡', '我亂說的', '愛音：我不知道', '天啊，大發現欸', '不是很可愛嗎', '妳想幹嘛', '為什麼都不講話', '樂奈抹茶巴菲', '祥子驚嚇', '是這樣沒錯', '這是在講什麼', '妳想說什麼', '這...', '我早知道會這樣了', '我好難受...好難受...', '來', '我看妳只是在逃避吧', '太先入為主了喔', '妳先再稍微等一下吧', '坦白說我都聽得一頭霧水', '它沒有結束', '對不起，忍不住就', '事情都搞砸了', '我想妳心裡多少也有些想法吧', '還有這樣太不負責了吧', '不要', '愛音愛心', '爽世看手機', '我已經徹底失敗了', '她真的好溫柔喔', '已經死了', '有趣的女人', '這是夢嗎', '妳是抱著多大的覺悟說出這種話的', '不是這樣', '爽世驚訝', '怎麼了嗎', '人生這麼漫長會撐不住的喔', '到現在還執著於過去，真難看', '是啊，到底為什麼呢', '妳也為別人設想一下嘛', '無趣的女孩子', '真是遺憾', '沒錯沒錯', '妳很煩欸', '真是太好了', '一旦加入就無法回頭了喔', '怎麼這麼問', '我哪裡有興奮了', '可以請妳別提起那件事嗎', '妳不是不需要我了嗎', '我不論如何都想當面向妳道歉', '就是這個', '我現在要講很感性的話，聽我說嘛', '祝妳幸福', '太棒了，爽世同學LOVE', '大家真沒品味', '真是會虛情假意呢', '可以請妳刪除剛才的影片嗎', '全是一些無趣的女人', '燈：我不知道', '我還是會繼續下去', '是妳先來找我麻煩的吧', '妳這話是認真的嗎', '不要這樣', '態度好差喔', '有點不太能想像呢', '掰掰', '我哪有可能有辦法', '我需要愛音', '妳到底想幹嘛', '那些不是重點吧', '從來不覺得玩樂團開心過', '睦（笑）', '運氣真好', '我害怕受到傷害', '這種事不重要吧', '妳有好好看訊息嗎', '是啊', '那當然是騙人的啊', '還真是高高在上呢', '不要吼我啦', '是嗎', '不知道', '初華看手機', '祥子看手機', '騙人是什麼意思', '需要我待會再過來嗎', '那傢伙已經不行了', '那傢伙不會回來了', '妳怎麼不找我們去', '為什麼', '相信也不會有人責怪我的', '痛痛啊痛痛啊快飛走吧', '做事笨拙總是徒勞', '差勁2', '這麼快等一下啦', '妳對組樂團有興趣嗎', '貴安', '真是讓人活得難受的世界啊', '要做什麼', '感覺不錯', '真的嗎太好了', '但可能只是我們會錯意啊', '那我也要', '我有安排了', '只要有小燈在就夠了吧', '冒昧請教妳一件事', '那些全都是騙人的', '過來吧', '是這個意思嗎', '我受夠了所以我才', '這裡就是我們的新家喔', '已經和我沒有關係了', '讓妳們久等了', '已經不可能了', '我們沒辦法再重新開始嗎', '妳在做甚麼', '媽媽很棒對不對', '就表示不需要這傢伙了吧', '等一下', '那個誓言呢', '樂團不需要我了吧', '等一下啦', '畏畏縮縮哭哭啼啼的我', '就算稍稍喘口氣休息一下', '再繼續四分五裂下去', '到底是哪個', '不行了', '我是因為要利用她才表現得很溫柔', '妳今天有空嗎', '我都會盡可能參加', '我一直非常期待能和各位見面1', '請多多指教', '我和那傢伙談過了', '這一切的一切全都是我', '什麼叫不是這樣', '走吧', '我會繼續做自己的夥伴', '可以和我一起過去看看嗎', '不想組什麼樂團的', '沒有不可能', '誓言', '那些妳全都知道卻一直在背叛她嗎', '原來如此', '真是稀奇呢', '所以妳要問什麼', '我也很想去喔', '這邊這邊', '要是沒有小祥妳們的話我就', '要不要過去看看', '只有我這麼想嗎', '有辦法背負其他人的人生嗎', '我們一定傷害到妳了吧', '因為我也有點在意', '甚麼都願意做就是這麼沉重的話', '我不論如何都想向妳道歉', '我實在沒有辦法', '做不來的事就別隨便說出口', '今後不要再和我扯上關係了', '這是最後的警告', '求求妳', '謝謝妳今天願意來見我', '我有哪裡有誤會了', '妳為什麼要我忘記呢', '放開我', '我們本來真的沒有要演奏春日影的', '可是我真的', '不要走', '絕對不可能再復活了', '那又怎麼樣', '妳講的話和做的事全都互相矛盾', '我們以前感情明明那麼好', '妳也差不多該忘記了吧', '真的很對不起', '大家每天都快樂地相處在一起', '可是', '妳這個人', '妳們就請便吧', '那些跟現在有關係嗎', '什麼跟什麼啊', '那個', '也不是這樣', '我在這裡再次感謝大家今天願意參加集會', '動機太不單純了', '我沒聽過這首歌', '妳好', '普通和理所當然到底是什麼呢', '妳不記得了嗎', '理想不會放得太高了嗎', '我也會努力看看的', '不是按那邊啦', '等一下再來聽聽看吧', '這問題問得好', '我家裡有', '她和我約好要一輩子組樂團了', '妳在幹嘛啊', 'Soyorin', '不是不是', '她笑了', '光是會寫就很厲害了', '我', '不可能吧', '可以請妳做個自我介紹嗎', '我就是有認真想才提這個的啊', '一起共同演奏音樂的命運共同體了', '有人回覆嗎', '妳說什麼？', '他沒有說要退出', '對不起', '唱得很棒喔', '請慢慢享用', '好厲害喔', '畢竟我們不過是群一丘之貂罷了', '我就不用了', '是沒關係沒錯', '她也會緊張吧', '真讓人期待', '麻煩妳了', '以前時有耳聞', '好可以了', '一起加油吧', '妳叫什麼名字', '這首是我的', '不知道', '讓人說不出話來了', '請妳不要生小睦的氣喔', '全都失敗了', '那首歌真的很棒呢', '可以吃了嗎', '太棒了', '不是啊', '現在的我們像是一盤散沙', '看完了', '我一直非常期待能和各位見面', '我也好想看看喔', '我要封鎖他', '不會有問題的', '想喝什麼都可以自己拿', '不會吧', '讓我深深受到感動', '畢竟這是一輩子的事', '沒在開玩笑我是認真的', '這布局可說是堅若磐石', '我會為妳加油的', '好好說明清楚', '是這樣嗎', '我們是MyGO', '已經算跨出一大步了喔', '爽世：太好了', '就說我不用了啦', "It's my go耶, it's my go", '祥子是這樣嗎', '那是歌詞嗎', '我先去一下洗手間', '我都還沒好好告訴過妳', '要演奏什麼音樂', '那個誓言是騙人的', '妳唱得簡直太棒了', '我可以用嗎', '是這種感覺啊', '真不愧是人氣寵兒', '真恐怖', '現在正是復權的時刻', '這樣太奇怪了吧', '我好想成為人類啊', '人類真是殘酷', '我們一起叫吧', '這些該不會都是歌詞吧', '妳只不過是一個學生', '盯...', '我看看', '好溫柔', '或許也不是真的不可能吧', '我都說一直都有在看了啊', '一丘之貂', '我們大家都很受傷', '不是這樣的2', '是啊(開心版)', '等一下妳是認真的嗎', '難道妳是第一次來嗎', '能不能也教我用呢', '那傢伙根本就不打算組新樂團', '初華：太好了', '貓貓喝水', '那傢伙竟敢無視燈']
你的回覆只能從規定的回覆內容列表中挑選後，一字不差的回覆，不可以自行添加或修改回覆內容`
  }

  const getResponse = async (prompt: string): Promise<string> => {
    const apiKey = (await configManager.getConfig('geminiApiKey')) || ''
    if (!apiKey) {
      error.value = 'API key is missing'
      throw new Error(error.value)
    }

    if (!prompt) {
      error.value = 'Prompt cannot be empty'
      throw new Error(error.value)
    }

    isLoading.value = true
    error.value = null

    const systemPrompt = loadPrompt()
    const model = await configManager.getConfig('model') || geminiModels.default

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          systemInstruction: {
            role: 'user',
            parts: [
              {
                text: systemPrompt,
              },
            ],
          },
          generationConfig: {
            temperature: 1,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
            responseMimeType: 'text/plain',
          },
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Google Gemini API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      const result = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()

      if (!result) {
        throw new Error('No content returned from the API')
      }

      return result
    } catch (err: any) {
      error.value = err.message || 'Unknown error'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    getResponse,
    isLoading,
    error,
  }
}
