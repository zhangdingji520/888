import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Search, X, ChevronLeft, MapPin, Clock, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CityAirport {
  iata: string;
  city: string;
  name: string;
  country: string;
}

// ─── Static airport data ──────────────────────────────────────────────────────

const DOMESTIC: CityAirport[] = [
  // A
  { iata: "AKU", city: "阿克苏", name: "温宿机场", country: "中国" },
  { iata: "AOG", city: "鞍山", name: "腾鳌机场", country: "中国" },
  { iata: "AQG", city: "安庆", name: "天柱山机场", country: "中国" },
  { iata: "AVA", city: "安顺", name: "黄果树机场", country: "中国" },
  // B
  { iata: "BFJ", city: "毕节", name: "飞雄机场", country: "中国" },
  { iata: "BHY", city: "北海", name: "福成机场", country: "中国" },
  { iata: "BJS", city: "北京", name: "北京(全城)", country: "中国" },
  { iata: "BPE", city: "朝阳", name: "朝阳机场", country: "中国" },
  { iata: "BSD", city: "保山", name: "保山机场", country: "中国" },
  // C
  { iata: "CAN", city: "广州", name: "白云国际机场", country: "中国" },
  { iata: "CGO", city: "郑州", name: "新郑国际机场", country: "中国" },
  { iata: "CGQ", city: "长春", name: "龙嘉国际机场", country: "中国" },
  { iata: "CIF", city: "赤峰", name: "玉龙机场", country: "中国" },
  { iata: "CIH", city: "长治", name: "王村机场", country: "中国" },
  { iata: "CKG", city: "重庆", name: "江北国际机场", country: "中国" },
  { iata: "CSX", city: "长沙", name: "黄花国际机场", country: "中国" },
  { iata: "CTU", city: "成都", name: "双流国际机场", country: "中国" },
  // D
  { iata: "DAT", city: "大同", name: "云冈机场", country: "中国" },
  { iata: "DCY", city: "稻城", name: "亚丁机场", country: "中国" },
  { iata: "DLC", city: "大连", name: "周水子国际机场", country: "中国" },
  { iata: "DNH", city: "敦煌", name: "莫高机场", country: "中国" },
  { iata: "DQA", city: "大庆", name: "萨尔图机场", country: "中国" },
  { iata: "DSN", city: "鄂尔多斯", name: "伊金霍洛机场", country: "中国" },
  { iata: "DYG", city: "张家界", name: "荷花机场", country: "中国" },
  // E
  { iata: "ENH", city: "恩施", name: "许家坪机场", country: "中国" },
  { iata: "ERL", city: "二连浩特", name: "赛乌苏机场", country: "中国" },
  // F
  { iata: "FOC", city: "福州", name: "长乐国际机场", country: "中国" },
  { iata: "FUO", city: "佛山", name: "沙堤机场", country: "中国" },
  // G
  { iata: "GHN", city: "广汉", name: "广汉机场", country: "中国" },
  { iata: "GYS", city: "广元", name: "盘龙机场", country: "中国" },
  { iata: "GYU", city: "固原", name: "六盘山机场", country: "中国" },
  // H
  { iata: "HAK", city: "海口", name: "美兰国际机场", country: "中国" },
  { iata: "HET", city: "呼和浩特", name: "白塔国际机场", country: "中国" },
  { iata: "HGH", city: "杭州", name: "萧山国际机场", country: "中国" },
  { iata: "HIA", city: "淮安", name: "涟水机场", country: "中国" },
  { iata: "HJJ", city: "怀化", name: "芷江机场", country: "中国" },
  { iata: "HLD", city: "海拉尔", name: "东山机场", country: "中国" },
  { iata: "HNY", city: "衡阳", name: "南岳机场", country: "中国" },
  { iata: "HRB", city: "哈尔滨", name: "太平国际机场", country: "中国" },
  { iata: "HSN", city: "舟山", name: "普陀山机场", country: "中国" },
  { iata: "HTN", city: "和田", name: "和田机场", country: "中国" },
  { iata: "HYN", city: "台州", name: "路桥机场", country: "中国" },
  // J
  { iata: "JDZ", city: "景德镇", name: "罗家机场", country: "中国" },
  { iata: "JHG", city: "西双版纳", name: "嘎洒国际机场", country: "中国" },
  { iata: "JIL", city: "吉林", name: "二台子机场", country: "中国" },
  { iata: "JJN", city: "泉州", name: "晋江机场", country: "中国" },
  { iata: "JMU", city: "佳木斯", name: "佳木斯机场", country: "中国" },
  { iata: "JNG", city: "济宁", name: "曲阜机场", country: "中国" },
  { iata: "JNZ", city: "锦州", name: "小岭子机场", country: "中国" },
  // K
  { iata: "KHN", city: "南昌", name: "昌北国际机场", country: "中国" },
  { iata: "KMG", city: "昆明", name: "长水国际机场", country: "中国" },
  { iata: "KOW", city: "赣州", name: "黄金机场", country: "中国" },
  { iata: "KRL", city: "库尔勒", name: "库尔勒机场", country: "中国" },
  { iata: "KRY", city: "克拉玛依", name: "克拉玛依机场", country: "中国" },
  { iata: "KWE", city: "贵阳", name: "龙洞堡国际机场", country: "中国" },
  { iata: "KWL", city: "桂林", name: "两江国际机场", country: "中国" },
  // L
  { iata: "LHW", city: "兰州", name: "中川国际机场", country: "中国" },
  { iata: "LJG", city: "丽江", name: "三义机场", country: "中国" },
  { iata: "LLF", city: "永州", name: "零陵机场", country: "中国" },
  { iata: "LNJ", city: "临沧", name: "临沧机场", country: "中国" },
  { iata: "LUM", city: "芒市", name: "芒市机场", country: "中国" },
  { iata: "LXA", city: "拉萨", name: "贡嘎机场", country: "中国" },
  { iata: "LYA", city: "洛阳", name: "北郊机场", country: "中国" },
  { iata: "LYG", city: "连云港", name: "白塔埠机场", country: "中国" },
  { iata: "LZH", city: "柳州", name: "白莲机场", country: "中国" },
  { iata: "LZO", city: "泸州", name: "云龙机场", country: "中国" },
  // M
  { iata: "MDG", city: "牡丹江", name: "海浪机场", country: "中国" },
  { iata: "MIG", city: "绵阳", name: "南郊机场", country: "中国" },
  { iata: "MXZ", city: "梅州", name: "梅县机场", country: "中国" },
  // N
  { iata: "NKG", city: "南京", name: "禄口国际机场", country: "中国" },
  { iata: "NLH", city: "宁蒗", name: "泸沽湖机场", country: "中国" },
  { iata: "NNG", city: "南宁", name: "吴圩国际机场", country: "中国" },
  { iata: "NTG", city: "南通", name: "兴东机场", country: "中国" },
  { iata: "NZH", city: "满洲里", name: "西郊机场", country: "中国" },
  // P
  { iata: "PEK", city: "北京", name: "首都国际机场", country: "中国" },
  { iata: "PKX", city: "北京", name: "大兴国际机场", country: "中国" },
  { iata: "PVG", city: "上海", name: "浦东国际机场", country: "中国" },
  // Q
  { iata: "RIZ", city: "日照", name: "日照机场", country: "中国" },
  // S
  { iata: "SHA", city: "上海", name: "虹桥国际机场", country: "中国" },
  { iata: "SHE", city: "沈阳", name: "桃仙国际机场", country: "中国" },
  { iata: "SJW", city: "石家庄", name: "正定国际机场", country: "中国" },
  { iata: "SYM", city: "普洱", name: "思茅机场", country: "中国" },
  { iata: "SYX", city: "三亚", name: "凤凰国际机场", country: "中国" },
  { iata: "SZX", city: "深圳", name: "宝安国际机场", country: "中国" },
  // T
  { iata: "TAO", city: "青岛", name: "胶东国际机场", country: "中国" },
  { iata: "TCG", city: "塔城", name: "塔城机场", country: "中国" },
  { iata: "TFU", city: "成都", name: "天府国际机场", country: "中国" },
  { iata: "TGO", city: "通辽", name: "通辽机场", country: "中国" },
  { iata: "TNA", city: "济南", name: "遥墙国际机场", country: "中国" },
  { iata: "TSN", city: "天津", name: "滨海国际机场", country: "中国" },
  { iata: "TVS", city: "唐山", name: "三女河机场", country: "中国" },
  { iata: "TXN", city: "黄山", name: "屯溪机场", country: "中国" },
  // U
  { iata: "URC", city: "乌鲁木齐", name: "地窝堡国际机场", country: "中国" },
  // W
  { iata: "WDS", city: "十堰", name: "武当山机场", country: "中国" },
  { iata: "WEF", city: "潍坊", name: "南苑机场", country: "中国" },
  { iata: "WUH", city: "武汉", name: "天河国际机场", country: "中国" },
  { iata: "WUS", city: "武夷山", name: "武夷山机场", country: "中国" },
  { iata: "WUX", city: "无锡", name: "硕放国际机场", country: "中国" },
  { iata: "WXN", city: "万州", name: "五桥机场", country: "中国" },
  // X
  { iata: "XFN", city: "襄阳", name: "刘集机场", country: "中国" },
  { iata: "XIL", city: "锡林浩特", name: "锡林浩特机场", country: "中国" },
  { iata: "XIY", city: "西安", name: "咸阳国际机场", country: "中国" },
  { iata: "XMN", city: "厦门", name: "高崎国际机场", country: "中国" },
  { iata: "XNN", city: "西宁", name: "曹家堡机场", country: "中国" },
  { iata: "XUZ", city: "徐州", name: "观音机场", country: "中国" },
  // Y
  { iata: "YBP", city: "宜宾", name: "五粮液机场", country: "中国" },
  { iata: "YCU", city: "运城", name: "张孝机场", country: "中国" },
  { iata: "YIH", city: "宜昌", name: "三峡机场", country: "中国" },
  { iata: "YIW", city: "义乌", name: "义乌机场", country: "中国" },
  { iata: "YNJ", city: "延吉", name: "朝阳川机场", country: "中国" },
  { iata: "YNT", city: "烟台", name: "蓬莱机场", country: "中国" },
  { iata: "YNZ", city: "盐城", name: "南洋机场", country: "中国" },
  // Z
  { iata: "ZAT", city: "昭通", name: "昭通机场", country: "中国" },
  { iata: "ZHA", city: "湛江", name: "吴川机场", country: "中国" },
  { iata: "ZHY", city: "中卫", name: "香山机场", country: "中国" },
  { iata: "ZUH", city: "珠海", name: "金湾机场", country: "中国" },
  { iata: "ZYI", city: "遵义", name: "新舟机场", country: "中国" },
];

const INTERNATIONAL: CityAirport[] = [
  { iata: "HKG", city: "中国香港", name: "香港国际机场", country: "中国香港" },
  { iata: "MFM", city: "中国澳门", name: "澳门国际机场", country: "中国澳门" },
  { iata: "TPE", city: "中国台北", name: "桃园国际机场", country: "中国台湾" },
  { iata: "AKL", city: "奥克兰", name: "奥克兰国际机场", country: "新西兰" },
  { iata: "AMS", city: "阿姆斯特丹", name: "史基浦机场", country: "荷兰" },
  { iata: "AUH", city: "阿布扎比", name: "阿布扎比国际机场", country: "阿联酋" },
  { iata: "BCN", city: "巴塞罗那", name: "埃尔普拉特机场", country: "西班牙" },
  { iata: "BKK", city: "曼谷", name: "素万那普机场", country: "泰国" },
  { iata: "BOM", city: "孟买", name: "贾特拉帕蒂·希瓦吉机场", country: "印度" },
  { iata: "CDG", city: "巴黎", name: "戴高乐机场", country: "法国" },
  { iata: "CGK", city: "雅加达", name: "苏加诺-哈达国际机场", country: "印度尼西亚" },
  { iata: "CJU", city: "济州岛", name: "济州国际机场", country: "韩国" },
  { iata: "CMB", city: "科伦坡", name: "班达拉奈克国际机场", country: "斯里兰卡" },
  { iata: "CNX", city: "清迈", name: "清迈国际机场", country: "泰国" },
  { iata: "DEL", city: "新德里", name: "英迪拉·甘地国际机场", country: "印度" },
  { iata: "DMK", city: "曼谷廊曼", name: "廊曼机场", country: "泰国" },
  { iata: "DOH", city: "多哈", name: "哈马德国际机场", country: "卡塔尔" },
  { iata: "DPS", city: "巴厘岛", name: "伍拉莱国际机场", country: "印度尼西亚" },
  { iata: "DXB", city: "迪拜", name: "迪拜国际机场", country: "阿联酋" },
  { iata: "FCO", city: "罗马", name: "菲乌米奇诺机场", country: "意大利" },
  { iata: "FRA", city: "法兰克福", name: "法兰克福机场", country: "德国" },
  { iata: "GMP", city: "首尔金浦", name: "金浦机场", country: "韩国" },
  { iata: "HAN", city: "河内", name: "内排国际机场", country: "越南" },
  { iata: "HKT", city: "普吉岛", name: "普吉国际机场", country: "泰国" },
  { iata: "HND", city: "东京羽田", name: "羽田机场", country: "日本" },
  { iata: "ICN", city: "首尔", name: "仁川国际机场", country: "韩国" },
  { iata: "IST", city: "伊斯坦布尔", name: "伊斯坦布尔机场", country: "土耳其" },
  { iata: "JFK", city: "纽约", name: "肯尼迪机场", country: "美国" },
  { iata: "KIX", city: "大阪", name: "关西国际机场", country: "日本" },
  { iata: "KUL", city: "吉隆坡", name: "吉隆坡国际机场", country: "马来西亚" },
  { iata: "LAX", city: "洛杉矶", name: "洛杉矶国际机场", country: "美国" },
  { iata: "LGW", city: "伦敦盖特威克", name: "盖特威克机场", country: "英国" },
  { iata: "LHR", city: "伦敦", name: "希思罗机场", country: "英国" },
  { iata: "MAD", city: "马德里", name: "巴拉哈斯机场", country: "西班牙" },
  { iata: "MEL", city: "墨尔本", name: "图拉马林机场", country: "澳大利亚" },
  { iata: "MNL", city: "马尼拉", name: "尼诺伊·阿基诺国际机场", country: "菲律宾" },
  { iata: "MXP", city: "米兰", name: "马尔彭萨机场", country: "意大利" },
  { iata: "NRT", city: "东京成田", name: "成田国际机场", country: "日本" },
  { iata: "ORD", city: "芝加哥", name: "奥黑尔国际机场", country: "美国" },
  { iata: "PNH", city: "金边", name: "金边国际机场", country: "柬埔寨" },
  { iata: "SEA", city: "西雅图", name: "塔科马国际机场", country: "美国" },
  { iata: "SFO", city: "旧金山", name: "旧金山国际机场", country: "美国" },
  { iata: "SGN", city: "胡志明市", name: "新山一国际机场", country: "越南" },
  { iata: "SIN", city: "新加坡", name: "樟宜机场", country: "新加坡" },
  { iata: "SVO", city: "莫斯科", name: "谢列梅捷沃机场", country: "俄罗斯" },
  { iata: "SYD", city: "悉尼", name: "金斯福德-史密斯机场", country: "澳大利亚" },
  { iata: "TLV", city: "特拉维夫", name: "本古里安机场", country: "以色列" },
  { iata: "VIE", city: "维也纳", name: "维也纳国际机场", country: "奥地利" },
  { iata: "YVR", city: "温哥华", name: "温哥华国际机场", country: "加拿大" },
  { iata: "YYZ", city: "多伦多", name: "皮尔逊国际机场", country: "加拿大" },
  { iata: "ZRH", city: "苏黎世", name: "苏黎世机场", country: "瑞士" },
];

const POPULAR_DOMESTIC_IATA = [
  "PEK", "PVG", "CAN", "SZX", "CTU", "CKG",
  "WUH", "XIY", "KMG", "HGH", "NKG", "XMN",
  "TSN", "SHE", "HRB", "TAO", "NNG", "SYX", "CSX", "KWE",
];

const POPULAR_INTL_IATA = [
  "HKG", "MFM", "TPE", "NRT", "ICN", "SIN",
  "BKK", "DXB", "LHR", "CDG", "JFK", "LAX",
  "SYD", "YYZ", "KUL", "KIX", "HKT", "DPS", "SGN", "YVR",
];

const ALL_AIRPORTS = [...DOMESTIC, ...INTERNATIONAL];

// ─── History helpers ──────────────────────────────────────────────────────────

const HISTORY_KEY = "skysearch-city-history";
const MAX_HISTORY = 8;

function loadHistory(): CityAirport[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveHistory(airport: CityAirport) {
  const prev = loadHistory().filter((a) => a.iata !== airport.iata);
  const next = [airport, ...prev].slice(0, MAX_HISTORY);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
}

// ─── Grouping helpers ─────────────────────────────────────────────────────────

function groupByFirstLetter(airports: CityAirport[]): Record<string, CityAirport[]> {
  const map: Record<string, CityAirport[]> = {};
  for (const a of airports) {
    const letter = a.iata[0].toUpperCase();
    if (!map[letter]) map[letter] = [];
    map[letter].push(a);
  }
  return map;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface CitySelectorProps {
  open: boolean;
  onClose: () => void;
  onSelect: (airport: CityAirport) => void;
  currentValue?: string;
}

export function CitySelector({
  open,
  onClose,
  onSelect,
  currentValue,
}: CitySelectorProps) {
  const [tab, setTab] = useState<"domestic" | "intl">("domestic");
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState<CityAirport[]>([]);
  const listRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Load history & auto-focus search on open
  useEffect(() => {
    if (open) {
      setHistory(loadHistory());
      setQuery("");
      setTimeout(() => searchRef.current?.focus(), 100);
    }
  }, [open]);

  const handleSelect = useCallback(
    (airport: CityAirport) => {
      saveHistory(airport);
      onSelect(airport);
      onClose();
    },
    [onSelect, onClose]
  );

  // Airports for the current tab
  const tabAirports = useMemo(
    () => (tab === "domestic" ? DOMESTIC : INTERNATIONAL),
    [tab]
  );

  // Popular grid
  const popularIata = tab === "domestic" ? POPULAR_DOMESTIC_IATA : POPULAR_INTL_IATA;
  const popularAirports = useMemo(
    () =>
      popularIata
        .map((iata) => tabAirports.find((a) => a.iata === iata))
        .filter(Boolean) as CityAirport[],
    [popularIata, tabAirports]
  );

  // Grouped by first letter (for the A-Z list)
  const grouped = useMemo(
    () => groupByFirstLetter(tabAirports),
    [tabAirports]
  );
  const letters = useMemo(() => Object.keys(grouped).sort(), [grouped]);

  // Search results (across domestic + international)
  const searchResults = useMemo(() => {
    const q = query.trim().toUpperCase();
    const ql = query.trim().toLowerCase();
    if (!q) return [];
    return ALL_AIRPORTS.filter(
      (a) =>
        a.iata.includes(q) ||
        a.city.toLowerCase().includes(ql) ||
        a.name.toLowerCase().includes(ql) ||
        a.country.toLowerCase().includes(ql)
    ).slice(0, 20);
  }, [query]);

  const scrollToLetter = (letter: string) => {
    const el = sectionRefs.current[letter];
    if (el && listRef.current) {
      listRef.current.scrollTo({ top: el.offsetTop - 8, behavior: "smooth" });
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-background">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="bg-primary text-primary-foreground shrink-0">
        <div className="flex items-center gap-2 px-3 py-2">
          <button
            onClick={onClose}
            className="text-primary-foreground/90 hover:text-primary-foreground text-sm font-medium whitespace-nowrap"
          >
            取消
          </button>
          <div className="flex-1 flex items-center gap-2 bg-white rounded-lg px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索城市或机场..."
              className="flex-1 text-sm text-foreground outline-none bg-transparent placeholder:text-muted-foreground"
            />
            {query && (
              <button onClick={() => setQuery("")}>
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        {!query && (
          <div className="flex">
            <button
              onClick={() => setTab("domestic")}
              className={cn(
                "flex-1 py-2.5 text-sm font-medium transition-colors border-b-2",
                tab === "domestic"
                  ? "border-white text-white"
                  : "border-transparent text-primary-foreground/70"
              )}
            >
              国内
            </button>
            <button
              onClick={() => setTab("intl")}
              className={cn(
                "flex-1 py-2.5 text-sm font-medium transition-colors border-b-2",
                tab === "intl"
                  ? "border-white text-white"
                  : "border-transparent text-primary-foreground/70"
              )}
            >
              国际/中国港澳台
            </button>
          </div>
        )}
      </div>

      {/* ── Body ───────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main scroll area */}
        <div ref={listRef} className="flex-1 overflow-y-auto">
          {query ? (
            /* ── Search results ── */
            <div>
              {searchResults.length === 0 ? (
                <div className="py-16 text-center text-muted-foreground text-sm">
                  未找到相关城市或机场
                </div>
              ) : (
                searchResults.map((airport) => (
                  <AirportRow
                    key={airport.iata}
                    airport={airport}
                    selected={airport.iata === currentValue}
                    onSelect={handleSelect}
                  />
                ))
              )}
            </div>
          ) : (
            /* ── Sections view ── */
            <div>
              {/* History */}
              {history.length > 0 && (
                <section className="px-4 pt-4 pb-2">
                  <SectionTitle icon={<Clock className="h-3.5 w-3.5" />} title="历史" />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {history.map((a) => (
                      <CityChip
                        key={a.iata}
                        airport={a}
                        selected={a.iata === currentValue}
                        onSelect={handleSelect}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Popular */}
              <section className="px-4 pt-3 pb-2">
                <SectionTitle icon={<Flame className="h-3.5 w-3.5" />} title="热门城市" />
                <div className="flex flex-wrap gap-2 mt-2">
                  {popularAirports.map((a) => (
                    <CityChip
                      key={a.iata}
                      airport={a}
                      selected={a.iata === currentValue}
                      onSelect={handleSelect}
                    />
                  ))}
                </div>
              </section>

              <div className="h-px bg-border mx-4 my-2" />

              {/* A–Z list */}
              {letters.map((letter) => (
                <div
                  key={letter}
                  ref={(el) => { sectionRefs.current[letter] = el; }}
                >
                  <div className="px-4 py-1 bg-muted/50">
                    <span className="text-xs font-bold text-muted-foreground">
                      {letter}
                    </span>
                  </div>
                  {(grouped[letter] ?? []).map((airport) => (
                    <AirportRow
                      key={airport.iata}
                      airport={airport}
                      selected={airport.iata === currentValue}
                      onSelect={handleSelect}
                    />
                  ))}
                </div>
              ))}

              <div className="h-16" />
            </div>
          )}
        </div>

        {/* Right letter index */}
        {!query && (
          <div className="flex flex-col items-center justify-start py-2 w-7 shrink-0 bg-background border-l select-none">
            {letters.map((letter) => (
              <button
                key={letter}
                onClick={() => scrollToLetter(letter)}
                className="w-full text-center text-[11px] font-medium py-0.5 text-primary hover:bg-primary/10 transition-colors"
              >
                {letter}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionTitle({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
      <span className="text-muted-foreground">{icon}</span>
      {title}
    </div>
  );
}

function CityChip({
  airport,
  selected,
  onSelect,
}: {
  airport: CityAirport;
  selected: boolean;
  onSelect: (a: CityAirport) => void;
}) {
  return (
    <button
      onClick={() => onSelect(airport)}
      className={cn(
        "px-3 py-1.5 rounded-full border text-sm font-medium transition-colors",
        selected
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-background text-foreground border-border hover:border-primary hover:text-primary"
      )}
    >
      {airport.city}
    </button>
  );
}

function AirportRow({
  airport,
  selected,
  onSelect,
}: {
  airport: CityAirport;
  selected: boolean;
  onSelect: (a: CityAirport) => void;
}) {
  return (
    <button
      onClick={() => onSelect(airport)}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border/40 text-left",
        selected && "bg-primary/5"
      )}
    >
      <MapPin
        className={cn(
          "h-4 w-4 shrink-0",
          selected ? "text-primary" : "text-muted-foreground"
        )}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "font-medium text-sm",
              selected ? "text-primary" : "text-foreground"
            )}
          >
            {airport.city}
          </span>
          <span className="text-xs text-muted-foreground font-mono">
            {airport.iata}
          </span>
        </div>
        <p className="text-xs text-muted-foreground truncate">{airport.name}</p>
      </div>
    </button>
  );
}
