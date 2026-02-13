import { x as attr_style, y as stringify, z as attr, F as attributes, G as clsx, J as bind_props, K as attr_class, N as ensure_array_like } from "../../chunks/index.js";
import { c as is_array, b as get_prototype_of, o as object_prototype, l as escape_html } from "../../chunks/context.js";
import "clsx";
import "html2canvas";
const empty = [];
function snapshot(value, skip_warning = false, no_tojson = false) {
  return clone(value, /* @__PURE__ */ new Map(), "", empty, null, no_tojson);
}
function clone(value, cloned, path, paths, original = null, no_tojson = false) {
  if (typeof value === "object" && value !== null) {
    var unwrapped = cloned.get(value);
    if (unwrapped !== void 0) return unwrapped;
    if (value instanceof Map) return (
      /** @type {Snapshot<T>} */
      new Map(value)
    );
    if (value instanceof Set) return (
      /** @type {Snapshot<T>} */
      new Set(value)
    );
    if (is_array(value)) {
      var copy = (
        /** @type {Snapshot<any>} */
        Array(value.length)
      );
      cloned.set(value, copy);
      if (original !== null) {
        cloned.set(original, copy);
      }
      for (var i = 0; i < value.length; i += 1) {
        var element = value[i];
        if (i in value) {
          copy[i] = clone(element, cloned, path, paths, null, no_tojson);
        }
      }
      return copy;
    }
    if (get_prototype_of(value) === object_prototype) {
      copy = {};
      cloned.set(value, copy);
      if (original !== null) {
        cloned.set(original, copy);
      }
      for (var key in value) {
        copy[key] = clone(
          // @ts-expect-error
          value[key],
          cloned,
          path,
          paths,
          null,
          no_tojson
        );
      }
      return copy;
    }
    if (value instanceof Date) {
      return (
        /** @type {Snapshot<T>} */
        structuredClone(value)
      );
    }
    if (typeof /** @type {T & { toJSON?: any } } */
    value.toJSON === "function" && !no_tojson) {
      return clone(
        /** @type {T & { toJSON(): any } } */
        value.toJSON(),
        cloned,
        path,
        paths,
        // Associate the instance with the toJSON clone
        value
      );
    }
  }
  if (value instanceof EventTarget) {
    return (
      /** @type {Snapshot<T>} */
      value
    );
  }
  try {
    return (
      /** @type {Snapshot<T>} */
      structuredClone(value)
    );
  } catch (e) {
    return (
      /** @type {Snapshot<T>} */
      value
    );
  }
}
const CHARACTER_IMAGES = [
  { frame: "2B", file: "Image/Characters/Coating-2B-Generic.webp" },
  { frame: "9S", file: "Image/Characters/Coating-9S-Generic.webp" },
  { frame: "A2", file: "Image/Characters/Coating-A2-Generic.webp" },
  { frame: "Aegis", file: "Image/Characters/Coating-Aegis-Generic.webp" },
  { frame: "Arca", file: "Image/Characters/Coating-Arca-Generic.webp" },
  { frame: "Arclight", file: "Image/Characters/Coating-Arclight-Generic.webp" },
  { frame: "Ardeo", file: "Image/Characters/Coating-Ardeo-Generic.webp" },
  { frame: "Astral", file: "Image/Characters/Coating-Astral-Generic.webp" },
  { frame: "Bastion", file: "Image/Characters/Coating-Bastion-Generic.webp" },
  { frame: "BLACK★ROCK SHOOTER", file: "Image/Characters/Coating-BLACK★ROCK SHOOTER-Generic.webp" },
  { frame: "Brilliance", file: "Image/Characters/Coating-Brilliance-Generic.webp" },
  { frame: "Capriccio", file: "Image/Characters/Coating-Capriccio-Generic.webp" },
  { frame: "Crepuscule", file: "Image/Characters/Coating-Crepuscule-Generic.webp" },
  { frame: "Crimson Abyss", file: "Image/Characters/Coating-Crimson Abyss-Generic.webp" },
  { frame: "Crimson Weave", file: "Image/Characters/Coating-Crimson Weave-Generic.webp" },
  { frame: "Crocotta", file: "Image/Characters/Coating-Crocotta-Generic.webp" },
  { frame: "Daemonissa", file: "Image/Characters/Coating-Daemonissa-Generic.webp" },
  { frame: "Dante", file: "Image/Characters/Coating-Dante-Generic.webp" },
  { frame: "Dawn", file: "Image/Characters/Coating-Dawn-Generic.webp" },
  { frame: "Daybreak", file: "Image/Characters/Coating-Daybreak-Generic.webp" },
  { frame: "Decryptor", file: "Image/Characters/Coating-Decryptor-Generic.webp" },
  { frame: "Echo", file: "Image/Characters/Coating-Echo-Generic.webp" },
  { frame: "Eclipse", file: "Image/Characters/Coating-Eclipse-Generic.webp" },
  { frame: "Ember", file: "Image/Characters/Coating-Ember-Generic.webp" },
  { frame: "Empyrea", file: "Image/Characters/Coating-Empyrea-Generic.webp" },
  { frame: "Entropy", file: "Image/Characters/Coating-Entropy-Generic.webp" },
  { frame: "Epitaph", file: "Image/Characters/Coating-Epitaph-Generic.webp" },
  { frame: "Feral", file: "Image/Characters/Coating-Feral-Generic.webp" },
  { frame: "Flambeau", file: "Image/Characters/Coating-Flambeau-Generic.webp" },
  { frame: "Fulgor", file: "Image/Characters/Coating-Fulgor-Generic.webp" },
  { frame: "Garnet", file: "Image/Characters/Coating-Garnet-Generic.webp" },
  { frame: "Geiravor", file: "Image/Characters/Coating-Geiravor-Generic.webp" },
  { frame: "Glory", file: "Image/Characters/Coating-Glory-Generic.webp" },
  { frame: "Hyperreal", file: "Image/Characters/Coating-Hyperreal-Generic.webp" },
  { frame: "Hypnos", file: "Image/Characters/Coating-Hypnos-Generic.webp" },
  { frame: "Indomitus", file: "Image/Characters/Coating-Indomitus-Generic.webp" },
  { frame: "Kaleido", file: "Image/Characters/Coating-Kaleido-Generic.webp" },
  { frame: "Laurel", file: "Image/Characters/Coating-Laurel-Generic.webp" },
  { frame: "Limpidity", file: "Image/Characters/Coating-Limpidity-Generic.webp" },
  { frame: "Lost Lullaby", file: "Image/Characters/Coating-Lost Lullaby-Generic.webp" },
  { frame: "Lotus", file: "Image/Characters/Coating-Lotus-Generic.webp" },
  { frame: "Lucid Dreamer", file: "Image/Characters/Coating-Lucid Dreamer-Generic.webp" },
  { frame: "Lux", file: "Image/Characters/Coating-Lux-Generic.webp" },
  { frame: "Oblivion", file: "Image/Characters/Coating-Oblivion-Generic.webp" },
  { frame: "Ornate Bell", file: "Image/Characters/Coating-Ornate Bell-Generic.webp" },
  { frame: "Parhelion", file: "Image/Characters/Coating-Parhelion-Generic.webp" },
  { frame: "Pavo", file: "Image/Characters/Coating-Pavo-Generic.webp" },
  { frame: "Pianissimo", file: "Image/Characters/Coating-Pianissimo-Generic.webp" },
  { frame: "Plume", file: "Image/Characters/Coating-Plume-Generic.webp" },
  { frame: "Pulse", file: "Image/Characters/Coating-Pulse-Generic.webp" },
  { frame: "Pyroath", file: "Image/Characters/Coating-Pyroath-Generic.webp" },
  { frame: "Qilin", file: "Image/Characters/Coating-Qilin-Generic.webp" },
  { frame: "Radiant Daybreak", file: "Image/Characters/Coating-Radiant Daybreak-Generic.webp" },
  { frame: "Remote Star", file: "Image/Characters/Coating-Remote Star-Generic.webp" },
  { frame: "Rigor", file: "Image/Characters/Coating-Rigor-Generic.webp" },
  { frame: "Rozen", file: "Image/Characters/Coating-Rozen-Generic.webp" },
  { frame: "Secator", file: "Image/Characters/Coating-Secator-Generic.webp" },
  { frame: "Shukra", file: "Image/Characters/Coating-Shukra-Generic.webp" },
  { frame: "Silverfang", file: "Image/Characters/Coating-Silverfang-Generic.webp" },
  { frame: "Solacetune", file: "Image/Characters/Coating-Solacetune-Generic.webp" },
  { frame: "Spectre", file: "Image/Characters/Coating-Spectre-Generic.webp" },
  { frame: "Startrail", file: "Image/Characters/Coating-Startrail-Generic.webp" },
  { frame: "Stigmata", file: "Image/Characters/Coating-Stigmata-Generic.webp" },
  { frame: "Storm", file: "Image/Characters/Coating-Storm-Generic.webp" },
  { frame: "Tempest", file: "Image/Characters/Coating-Tempest-Generic.webp" },
  { frame: "Tenebrion", file: "Image/Characters/Coating-Tenebrion-Generic.webp" },
  { frame: "Veiled Star", file: "Image/Characters/Coating-Veiled Star-Generic.webp" },
  { frame: "Vergil", file: "Image/Characters/Coating-Vergil-Generic.webp" },
  { frame: "Veritas", file: "Image/Characters/Coating-Veritas-Generic.webp" },
  { frame: "Vitrum", file: "Image/Characters/Coating-Vitrum-Generic.webp" },
  { frame: "XXI", file: "Image/Characters/Coating-XXI-Generic.webp" },
  { frame: "Zitherwoe", file: "Image/Characters/Coating-Zitherwoe-Generic.webp" }
];
const ELEMENT_IMAGES = {
  "burn": "Image/Elements/BURN.webp",
  "dark": "Image/Elements/DARK.webp",
  "fire": "Image/Elements/FIRE.webp",
  "freez": "Image/Elements/FREEZ.webp",
  "general": "Image/Elements/GENERAL.webp",
  "ice": "Image/Elements/ICE.webp",
  "light": "Image/Elements/LIGHT.webp",
  "nihl": "Image/Elements/NIHL.webp",
  "phys": "Image/Elements/PHYS.webp",
  "plasma": "Image/Elements/PLASMA.webp",
  "slash": "Image/Elements/SLASH.webp",
  "thunder": "Image/Elements/THUNDER.webp",
  "umbra": "Image/Elements/UMBRA.webp"
};
const CLASS_IMAGES = {
  "amplifier": "Image/Classes/Amplifier.webp",
  "annihilator": "Image/Classes/Annihilator.webp",
  "attacker": "Image/Classes/Attacker.webp",
  "observer": "Image/Classes/Observer.webp",
  "support": "Image/Classes/Support.webp",
  "tank": "Image/Classes/Tank.webp",
  "uniframe": "Image/Classes/Uniframe.webp",
  "vanguard": "Image/Classes/Vanguard.webp"
};
const WEAPON_IMAGES = {
  "akasha keyblade": "Image/Weapons/Akasha Keyblade.webp",
  "alpha omega": "Image/Weapons/Alpha Omega.webp",
  "apollo": "Image/Weapons/Apollo.webp",
  "astraea": "Image/Weapons/Astraea.webp",
  "aurora": "Image/Weapons/Aurora.webp",
  "baji": "Image/Weapons/Baji.webp",
  "benediction": "Image/Weapons/Benediction.webp",
  "berserk fusion": "Image/Weapons/Berserk Fusion.webp",
  "big kamui": "Image/Weapons/Big Kamui.webp",
  "cestus": "Image/Weapons/Cestus.webp",
  "crimson howl": "Image/Weapons/Crimson Howl.webp",
  "cruel oath mod": "Image/Weapons/Cruel Oath Mod.webp",
  "dark falcon": "Image/Weapons/Dark Falcon.webp",
  "darkness": "Image/Weapons/Darkness.webp",
  "deathless flame": "Image/Weapons/Deathless Flame.webp",
  "devil sword dante": "Image/Weapons/Devil Sword Dante.webp",
  "dragon wind": "Image/Weapons/Dragon Wind.webp",
  "dream roamer": "Image/Weapons/Dream Roamer.webp",
  "durendal": "Image/Weapons/Durendal.webp",
  "empyrean wrath": "Image/Weapons/Empyrean Wrath.webp",
  "final arbiter": "Image/Weapons/Final Arbiter.webp",
  "flamewing of dawn": "Image/Weapons/Flamewing of Dawn.webp",
  "fudo myoo": "Image/Weapons/Fudo Myoo.webp",
  "fusion dragon": "Image/Weapons/Fusion Dragon.webp",
  "galatea": "Image/Weapons/Galatea.webp",
  "gungnir": "Image/Weapons/Gungnir.webp",
  "hackerstune": "Image/Weapons/HackersTune.webp",
  "hecate": "Image/Weapons/Hecate.webp",
  "hestia": "Image/Weapons/Hestia.webp",
  "hydro heat": "Image/Weapons/Hydro Heat.webp",
  "illuminare": "Image/Weapons/Illuminare.webp",
  "implosion": "Image/Weapons/Implosion.webp",
  "infinity": "Image/Weapons/Infinity.webp",
  "inverse chimera": "Image/Weapons/Inverse Chimera.webp",
  "inverse shadow": "Image/Weapons/Inverse Shadow.webp",
  "key of tempus gate stokes": "Image/Weapons/Key of Tempus Gate Stokes.webp",
  "lotus berserker": "Image/Weapons/Lotus Berserker.webp",
  "managarm": "Image/Weapons/Managarm.webp",
  "metis": "Image/Weapons/Metis.webp",
  "neon wayfarer": "Image/Weapons/Neon Wayfarer.webp",
  "nightblaze": "Image/Weapons/Nightblaze.webp",
  "orpheus lullaby": "Image/Weapons/Orpheus Lullaby.webp",
  "osseous guillotine": "Image/Weapons/Osseous Guillotine.webp",
  "ozma": "Image/Weapons/Ozma.webp",
  "peacemaker": "Image/Weapons/Peacemaker.webp",
  "perpetuity": "Image/Weapons/Perpetuity.webp",
  "phoenix": "Image/Weapons/Phoenix.webp",
  "prometheus": "Image/Weapons/Prometheus.webp",
  "purple peony": "Image/Weapons/Purple Peony.webp",
  "qinghe": "Image/Weapons/Qinghe.webp",
  "ramiel": "Image/Weapons/Ramiel.webp",
  "reconstruction of law": "Image/Weapons/Reconstruction of Law.webp",
  "renewed dawn": "Image/Weapons/Renewed Dawn.webp",
  "ripplesofthe aloft sea": "Image/Weapons/Ripplesofthe Aloft Sea.webp",
  "sakura": "Image/Weapons/Sakura.webp",
  "sarastro": "Image/Weapons/Sarastro.webp",
  "sariel": "Image/Weapons/Sariel.webp",
  "scale": "Image/Weapons/Scale.webp",
  "scion": "Image/Weapons/Scion.webp",
  "snore": "Image/Weapons/Snore.webp",
  "sorrow of fata morgana": "Image/Weapons/Sorrow of Fata Morgana.webp",
  "soul ripper": "Image/Weapons/Soul Ripper.webp",
  "soundofsilence": "Image/Weapons/SoundofSilence.webp",
  "stelmo": "Image/Weapons/StElmo.webp",
  "starvoyager": "Image/Weapons/StarVoyager.webp",
  "starlightglare": "Image/Weapons/StarlightGlare.webp",
  "thanatos": "Image/Weapons/Thanatos.webp",
  "tonitrus": "Image/Weapons/Tonitrus.webp",
  "type-4o lance": "Image/Weapons/Type-4O Lance.webp",
  "typezero": "Image/Weapons/TypeZero.webp",
  "virtuous contract": "Image/Weapons/Virtuous Contract.webp",
  "waldmeister": "Image/Weapons/Waldmeister.webp",
  "wolffang": "Image/Weapons/WolfFang.webp",
  "yamato": "Image/Weapons/Yamato.webp",
  "zeroscale": "Image/Weapons/ZeroScale.webp",
  "rock cannon": "Image/Weapons/★Rock Cannon.webp",
  "crimson birch": "Image/Weapons/Crimson Birch.webp",
  "tranquil doll’s voice": "Image/Weapons/Tranquil Doll's Voice.webp",
  "inverse - chimera": "Image/Weapons/Inverse Chimera.webp",
  "inverse - shadow": "Image/Weapons/Inverse Shadow.webp",
  "wolf fang": "Image/Weapons/WolfFang.webp",
  "st. elmo": "Image/Weapons/StElmo.webp",
  "virtuous contract - mod": "Image/Weapons/Virtuous Contract.webp",
  "cruel oath - mod": "Image/Weapons/Cruel Oath Mod.webp",
  "type-4o lance - mod": "Image/Weapons/Type-4O Lance.webp",
  "key of tempus gate - stokes": "Image/Weapons/Key of Tempus Gate Stokes.webp",
  "the starry voyager": "Image/Weapons/StarVoyager.webp",
  "hacker's tune": "Image/Weapons/HackersTune.webp",
  "fudo myo-o": "Image/Weapons/Fudo Myoo.webp",
  "starlight glare": "Image/Weapons/StarlightGlare.webp",
  "alpha-omega": "Image/Weapons/Alpha Omega.webp",
  "orpheus' lullaby": "Image/Weapons/Orpheus Lullaby.webp",
  "ripples of the aloft sea": "Image/Weapons/Ripplesofthe Aloft Sea.webp",
  "zero scale": "Image/Weapons/ZeroScale.webp"
};
const CUB_IMAGES = {
  "beep-boop": "Image/CUB/Beep-Boop.webp",
  "billie": "Image/CUB/Billie.webp",
  "boreas": "Image/CUB/Boreas.webp",
  "bramble angler": "Image/CUB/Bramble Angler.webp",
  "cavaliere": "Image/CUB/Cavaliere.webp",
  "cetus": "Image/CUB/Cetus.webp",
  "corvus": "Image/CUB/Corvus.webp",
  "dawn chorus": "Image/CUB/Dawn Chorus.webp",
  "diamaton": "Image/CUB/Diamaton.webp",
  "dreamwing": "Image/CUB/Dreamwing.webp",
  "fei lin": "Image/CUB/Fei Lin.webp",
  "frost oath": "Image/CUB/Frost Oath.webp",
  "guardrake": "Image/CUB/Guardrake.webp",
  "hades fangs": "Image/CUB/Hades Fangs.webp",
  "huiyu": "Image/CUB/Huiyu.webp",
  "jet jaeger": "Image/CUB/Jet Jaeger.webp",
  "levvi": "Image/CUB/Levvi.webp",
  "mirageblades": "Image/CUB/MirageBlades.webp",
  "motorbolt": "Image/CUB/Motorbolt.webp",
  "nitor": "Image/CUB/Nitor.webp",
  "noctiluca": "Image/CUB/Noctiluca.webp",
  "punchy": "Image/CUB/Punchy.webp",
  "rainbow": "Image/CUB/Rainbow.webp",
  "scaled rampart": "Image/CUB/Scaled Rampart.webp",
  "shadow wing": "Image/CUB/Shadow Wing.webp",
  "snow waltz": "Image/CUB/Snow Waltz.webp",
  "snowveil": "Image/CUB/Snowveil.webp",
  "toniris": "Image/CUB/Toniris.webp",
  "wrathfang": "Image/CUB/Wrathfang.webp"
};
const MEMORY_NAMES = [
  "Aife",
  "Aline",
  "Alphonse",
  "Barcelo",
  "Bathlon",
  "Boone",
  "Burana",
  "Catherine",
  "Chang Wuzi",
  "Charlotte",
  "Chen Jiyuan",
  "Cleopatra",
  "Condelina",
  "Cottie",
  "Darwin",
  "DaVinci",
  "Derketo",
  "Diesel",
  "Einsteina",
  "Elizabeth",
  "Erwin",
  "Flamel",
  "Fran",
  "Frederick",
  "Gloria",
  "Guinevere",
  "Hanna",
  "Heisen",
  "Heraclitus",
  "Herschell",
  "Hervor",
  "Ike",
  "Jeanne",
  "Ji Boan",
  "Keats",
  "Klenova",
  "Leeuwenhoek",
  "Liston",
  "Mozart",
  "Natasha",
  "Patton",
  "PhilipII",
  "Poincare",
  "Richelieu",
  "Samantha",
  "Seraphine",
  "Shakespeare",
  "Signa",
  "Sothoth",
  "Tifa",
  "Turing",
  "Unimate",
  "Voltaire",
  "Wilde"
];
const CHAR_DATABASE = [
  {
    name: "Люсия",
    frame: "Лотус",
    enFrame: "Lotus",
    rank: "B",
    element: "Физический",
    class: "Атакующий",
    weapon: "Lotus Berserker"
  },
  {
    name: "Лив",
    frame: "Эклипс",
    enFrame: "Eclipse",
    rank: "B",
    element: "Физический",
    class: "Поддержка",
    weapon: "Type Zero"
  },
  {
    name: "Нанами",
    frame: "Шторм",
    enFrame: "Storm",
    rank: "B",
    element: "Физический",
    class: "Танк",
    weapon: "Inverse - Chimera"
  },
  {
    name: "Люсия",
    frame: "Давн",
    enFrame: "Dawn",
    rank: "A",
    element: "Молния",
    class: "Атакующий",
    weapon: "Inverse - Shadow"
  },
  {
    name: "Лив",
    frame: "Люкс",
    enFrame: "Lux",
    rank: "A",
    element: "Молния",
    class: "Поддержка",
    weapon: "Benediction"
  },
  {
    name: "Ли",
    frame: "Пэйлфаер",
    enFrame: "Palefire",
    rank: "A",
    element: "Огонь",
    class: "Атакующий",
    weapon: "Wolf Fang"
  },
  {
    name: "Ватанабэ",
    frame: "Найтблейд",
    enFrame: "Nightblade",
    rank: "A",
    element: "Физический",
    class: "Атакующий",
    weapon: "Soul Ripper"
  },
  {
    name: "Бьянка",
    frame: "Зеро",
    enFrame: "Zero",
    rank: "A",
    element: "Физический",
    class: "Атакующий",
    weapon: "Ramiel"
  },
  {
    name: "Каренина",
    frame: "Бласт",
    enFrame: "Blast",
    rank: "A",
    element: "Физический",
    class: "Атакующий",
    weapon: "Berserk Fusion"
  },
  {
    name: "Лив",
    frame: "Люменанс",
    enFrame: "Luminance",
    rank: "S",
    element: "Физический",
    class: "Поддержка",
    weapon: "Dragon Wind"
  },
  {
    name: "Ли",
    frame: "Энтропи",
    enFrame: "Entropy",
    rank: "S",
    element: "Физический",
    class: "Атакующий",
    weapon: "Zero Scale"
  },
  {
    name: "Каренина",
    frame: "Эмбер",
    enFrame: "Ember",
    rank: "S",
    element: "Огонь",
    class: "Атакующий",
    weapon: "Fusion Dragon"
  },
  {
    name: "Нанами",
    frame: "Пульс",
    enFrame: "Pulse",
    rank: "S",
    element: "Огонь",
    class: "Танк",
    weapon: "Hydro Heat"
  },
  {
    name: "Камуи",
    frame: "Тенебрион",
    enFrame: "Tenebrion",
    rank: "S",
    element: "Тьма",
    class: "Танк",
    weapon: "Darkness"
  },
  {
    name: "Люсия",
    frame: "Кримзон Абисс",
    enFrame: "Crimson Abyss",
    rank: "S",
    element: "Физический",
    class: "Атакующий",
    weapon: "Sakura"
  },
  {
    name: "Камуи",
    frame: "Бастион",
    enFrame: "Bastion",
    rank: "A",
    element: "Физический",
    class: "Танк",
    weapon: "Big Kamui"
  },
  {
    name: "Ватанабэ",
    frame: "Астрал",
    enFrame: "Astral",
    rank: "A",
    element: "Тьма",
    class: "Атакующий",
    weapon: "Peacemaker"
  },
  {
    name: "Айла",
    frame: "Брилианс",
    enFrame: "Brilliance",
    rank: "A",
    element: "Физический",
    class: "Танк",
    weapon: "Purple Peony"
  },
  {
    name: "Бьянка",
    frame: "Веритас",
    enFrame: "Veritas",
    rank: "S",
    element: "Молния",
    class: "Атакующий",
    weapon: "Tonitrus",
    cub: "Toniris"
  },
  {
    name: "София",
    frame: "Сильверфанг",
    enFrame: "Silverfang",
    rank: "A",
    element: "Огонь",
    class: "Поддержка",
    weapon: "Scion"
  },
  {
    name: "Хром",
    frame: "Арклайт",
    enFrame: "Arclight",
    rank: "A",
    element: "Молния",
    class: "Танк",
    weapon: "St. Elmo"
  },
  {
    name: "Люсия",
    frame: "Плюм",
    enFrame: "Plume",
    rank: "S",
    element: "Лед",
    class: "Атакующий",
    weapon: "Crimson Birch"
  },
  {
    name: "Вера",
    frame: "Розен",
    enFrame: "Rozen",
    rank: "A",
    element: "Тьма",
    class: "Поддержка",
    weapon: "Sariel"
  },
  {
    name: "Каму",
    frame: "Крокотта",
    enFrame: "Crocotta",
    rank: "S",
    element: "Тьма",
    class: "Авангард",
    weapon: "Thanatos"
  },
  {
    name: "Розетта",
    frame: "Ригор",
    enFrame: "Rigor",
    rank: "S",
    element: "Физический",
    class: "Танк",
    weapon: "Gungnir",
    cub: "Frost Oath"
  },
  {
    name: "Чангю",
    frame: "Цилинь",
    enFrame: "Qilin",
    rank: "A",
    element: "Лед",
    class: "Танк",
    weapon: "Baji"
  },
  {
    name: "Цюй",
    frame: "Паво",
    enFrame: "Pavo",
    rank: "S",
    element: "Физический",
    class: "Авангард",
    weapon: "Qinghe"
  },
  {
    name: "Луна",
    frame: "Лаурель",
    enFrame: "Laurel",
    rank: "S",
    element: "Тьма",
    class: "Атакующий",
    weapon: "Ozma"
  },
  {
    name: "2B",
    frame: "",
    enFrame: "2B",
    rank: "S",
    element: "Физический",
    class: "Атакующий",
    weapon: "Virtuous Contract - Mod"
  },
  {
    name: "9S",
    frame: "",
    enFrame: "9S",
    rank: "S",
    element: "Физический",
    class: "Поддержка",
    weapon: "Cruel Oath - Mod"
  },
  {
    name: "A2",
    frame: "",
    enFrame: "A2",
    rank: "S",
    element: "Физический",
    class: "Танк",
    weapon: "Type-4O Lance - Mod"
  },
  {
    name: "Ваньши",
    frame: "Гипнос",
    enFrame: "Hypnos",
    rank: "A",
    element: "Лед",
    class: "Поддержка",
    weapon: "Scale"
  },
  {
    name: "Селена",
    frame: "Темпест",
    enFrame: "Tempest",
    rank: "S",
    element: "Молния",
    class: "Авангард",
    weapon: "Waldmeister"
  },
  {
    name: "Хром",
    frame: "Глори",
    enFrame: "Glory",
    rank: "S",
    element: "Лед",
    class: "Танк",
    weapon: "Apollo",
    cub: "Boreas"
  },
  {
    name: "21",
    frame: "XXI",
    enFrame: "XXI",
    rank: "A",
    element: "Тьма",
    class: "Танк",
    weapon: "Snore"
  },
  {
    name: "Вера",
    frame: "Гарнет",
    enFrame: "Garnet",
    rank: "S",
    element: "Молния",
    class: "Танк",
    weapon: "Phoenix"
  },
  {
    name: "Роланд",
    frame: "Фламбеа",
    enFrame: "Flambeau",
    rank: "S",
    element: "Огонь",
    class: "Авангард",
    weapon: "Durendal"
  },
  {
    name: "Лив",
    frame: "Эмпирей",
    enFrame: "Empyrea",
    rank: "S",
    element: "Огонь",
    class: "Амплифаер",
    weapon: "Hestia"
  },
  {
    name: "Селена",
    frame: "Каприччио",
    enFrame: "Capriccio",
    rank: "S",
    element: "Тьма",
    class: "Амплифаер",
    weapon: "Sarastro"
  },
  {
    name: "Пулао",
    frame: "Драгонтол",
    enFrame: "Dragontoll",
    rank: "S",
    element: "Физический",
    class: "Авангард",
    weapon: "Infinity"
  },
  {
    name: "Нанами",
    frame: "Старфарер",
    enFrame: "Starfarer",
    rank: "S",
    element: "Огонь",
    class: "Танк",
    weapon: "Implosion",
    cub: "Jet Jaeger"
  },
  {
    name: "Хаикма",
    frame: "",
    enFrame: "Starveil",
    rank: "S",
    element: "Лед",
    class: "Авангард",
    weapon: "Galatea"
  },
  {
    name: "Каренина",
    frame: "Скайр",
    enFrame: "Scire",
    rank: "S",
    element: "Тьма",
    class: "Танк",
    weapon: "Illuminare",
    affix: "Plasma",
    cub: "Moonhopper"
  },
  {
    name: "Ноан",
    frame: "Арка",
    enFrame: "Arca",
    rank: "S",
    element: "Молния",
    class: "Авангард",
    weapon: "Prometheus"
  },
  {
    name: "Бьянка",
    frame: "Стигмата",
    enFrame: "Stigmata",
    rank: "S",
    element: "Физический",
    class: "Атакующий",
    weapon: "Hecate",
    affix: "Slash",
    cub: "Shimmer"
  },
  {
    name: "Бамбината",
    frame: "Витрум",
    enFrame: "Vitrum",
    rank: "A",
    element: "Лед",
    class: "Атакующий",
    weapon: "Tranquil Doll’s Voice"
  },
  {
    name: "Ли",
    frame: "Гиперреал",
    enFrame: "Hyperreal",
    rank: "S",
    element: "Огонь",
    class: "Атакующий",
    weapon: "Key of Tempus Gate - Stokes",
    cub: "Punchy"
  },
  {
    name: "Айла",
    frame: "Калеидо",
    enFrame: "Kaleido",
    rank: "S",
    element: "Лед",
    class: "Амплифаер",
    weapon: "The Starry Voyager",
    cub: "Rainbow"
  },
  {
    name: "Люсия",
    frame: "Кримзон Вейв",
    enFrame: "Crimson Weave",
    rank: "S",
    element: "Молния",
    class: "Атакующий",
    weapon: "Nightblaze",
    affix: "Umbra",
    cub: "Motorbolt"
  },
  {
    name: "Ханьин",
    frame: "Зитервоу",
    enFrame: "Zitherwoe",
    rank: "A",
    element: "Физический",
    class: "Поддержка",
    weapon: "Perpetuity"
  },
  {
    name: "21",
    frame: "Feral",
    enFrame: "Feral",
    rank: "S",
    element: "Молния",
    class: "Амплифаер",
    weapon: "Managarm",
    cub: "Hades Fangs"
  },
  {
    name: "Ноктис",
    frame: "Индормитус",
    enFrame: "Indomitus",
    rank: "A",
    element: "Молния",
    class: "Атакующий",
    weapon: "Crimson Howl"
  },
  {
    name: "Алиса",
    frame: "Эхо",
    enFrame: "Echo",
    rank: "S",
    element: "Физический",
    class: "Амплифаер",
    weapon: "Astraea",
    affix: "Freez",
    cub: "Dawn Chorus"
  },
  {
    name: "Ламия",
    frame: "Лост Лулаби",
    enFrame: "Lost Lullaby",
    rank: "S",
    element: "Тьма",
    class: "Атакующий",
    weapon: "Metis",
    cub: "Cetus"
  },
  {
    name: "Ватанабэ",
    frame: "Эпитаф",
    enFrame: "Epitaph",
    rank: "S",
    element: "Огонь",
    class: "Танк",
    weapon: "Dark Falcon",
    affix: "Umbra",
    cub: "Shadow Wing"
  },
  {
    name: "Цюй",
    frame: "Шукра",
    enFrame: "Shukra",
    rank: "S",
    element: "Лед",
    class: "Атакующий",
    weapon: "Akasha Keyblade",
    cub: "Huiyu"
  },
  {
    name: "Тедди",
    frame: "Декриптор",
    enFrame: "Decryptor",
    rank: "A",
    element: "Тьма",
    class: "Поддержка",
    weapon: "Hacker's Tune"
  },
  {
    name: "Луна",
    frame: "Обливион",
    enFrame: "Oblivion",
    rank: "S",
    element: "Нихил",
    class: "Атакующий",
    weapon: "Reconstruction of Law",
    cub: "Guardrake"
  },
  {
    name: "Бриджит",
    frame: "Ардео",
    enFrame: "Ardeo",
    rank: "A",
    element: "Огонь",
    class: "Танк",
    weapon: "Cestus"
  },
  {
    name: "Ханьин",
    frame: "Соласетюн",
    enFrame: "Solacetune",
    rank: "S",
    element: "Физический",
    class: "Танк",
    weapon: "Dream Roamer",
    affix: "Slash",
    cub: "Dreamwing"
  },
  {
    name: "Ваньши",
    frame: "Лусид Дример",
    enFrame: "Lucid Dreamer",
    rank: "S",
    element: "Лед",
    class: "Танк",
    weapon: "Renewed Dawn",
    affix: "Freez",
    cub: "Snowveil"
  },
  {
    name: "Люсия",
    frame: "Пироат",
    enFrame: "Pyropath",
    rank: "S",
    element: "Огонь",
    class: "Атакующий",
    weapon: "Flamewing of Dawn",
    affix: "Plasma",
    cub: "Corvus"
  },
  {
    name: "Ята",
    frame: "Фулгор",
    enFrame: "Fulgor",
    rank: "A",
    element: "Молния",
    class: "Атакующий",
    weapon: "Fudo Myo-o"
  },
  {
    name: "Нанами",
    frame: "Стартрейл",
    enFrame: "Startrail",
    rank: "S",
    element: "Молния",
    class: "Танк",
    weapon: "Starlight Glare",
    affix: "Burn",
    cub: "Bramble Angler"
  },
  {
    name: "Ишмаэль",
    frame: "Пархелион",
    enFrame: "Parhelion",
    rank: "S",
    element: "Нихил",
    class: "Наблюдатель",
    weapon: "Alpha-Omega",
    affix: "Disruption",
    cub: "Diamaton"
  },
  {
    name: "Лилит",
    frame: "Демонисса",
    enFrame: "Daemonissa",
    rank: "S",
    element: "Тьма",
    class: "Амплифаер",
    weapon: "Sorrow of Fata Morgana",
    affix: "Plasma",
    cub: "Billie"
  },
  {
    name: "Селена",
    frame: "Пианиссимо",
    enFrame: "Pianissimo",
    rank: "S",
    element: "Физический",
    class: "Атакующий",
    weapon: "Orpheus' Lullaby",
    affix: "Freez",
    cub: "Snow Waltz"
  },
  {
    name: "Джетави",
    frame: "Дейбрейкер",
    enFrame: "Daybreak",
    rank: "A",
    element: "Тьма",
    class: "Атакующий",
    weapon: "Final Arbiter"
  },
  {
    name: "Вера",
    frame: "Гейравёр",
    enFrame: "Geiravor",
    rank: "S",
    element: "Огонь",
    class: "Амплифаер",
    weapon: "Deathless Flame",
    affix: "Umbra",
    cub: "Wrathfang"
  },
  {
    name: "Dante",
    frame: "Данте",
    enFrame: "Dante",
    rank: "S",
    element: "Огонь",
    class: "Атакующий",
    weapon: "Devil Sword Dante",
    affix: "Burn",
    cub: "Cavaliere"
  },
  {
    name: "Vergil",
    frame: "",
    enFrame: "Vergil",
    rank: "S",
    element: "Физический",
    class: "Атакующий",
    weapon: "Yamato",
    affix: "Slash",
    cub: "Mirage Blades"
  },
  {
    name: "Бьянка",
    frame: "Крепускул",
    enFrame: "Crepuscule",
    rank: "S",
    element: "Тьма",
    class: "Атакующий",
    weapon: "Aurora",
    affix: "Light",
    cub: "Noctiluca"
  },
  {
    name: "Дискорд",
    frame: "Секатор",
    enFrame: "Secator",
    rank: "A",
    element: "Физический",
    class: "Атакующий",
    weapon: "Osseous Guillotine",
    affix: "Slash"
  },
  {
    name: "Вероника",
    frame: "Аегис",
    enFrame: "Aegis",
    rank: "S",
    element: "Физический",
    class: "Амплифаер",
    weapon: "Empyrean Wrath",
    affix: "Burn",
    cub: "Scaled Rampart"
  },
  {
    name: "Лив",
    frame: "Лимпидити",
    enFrame: "Limpidity",
    rank: "S",
    element: "Молния",
    class: "Атакующий",
    weapon: "Ripples of the Aloft Sea",
    affix: "Umbra",
    cub: "Levvi"
  },
  {
    name: "Тедди",
    frame: "Спектр",
    enFrame: "Spectre",
    rank: "S",
    element: "Лед",
    class: "Амплифаер",
    weapon: "Neon Wayfarer",
    affix: "Light",
    cub: "Beep-Boop"
  },
  {
    name: "BLACK★ROCK SHOOTER",
    frame: "",
    enFrame: "BLACK★ROCK SHOOTER",
    rank: "A",
    element: "Огонь",
    class: "Атакующий",
    weapon: "★Rock Cannon"
  }
];
const ASSET_MAP = {};
const RUS_TO_ENG_MAP = {
  // Elements
  "физический": "phys",
  "молния": "thunder",
  "огонь": "fire",
  "тьма": "dark",
  "лед": "ice",
  // Classes
  "атакующий": "attacker",
  "поддержка": "support",
  "танк": "tank",
  "авангард": "vanguard",
  "амплифаер": "amplifier",
  "унифрейм": "uniframe"
};
for (let img of CHARACTER_IMAGES) {
  ASSET_MAP[img.frame.toLowerCase()] = img.file;
}
for (let key in ELEMENT_IMAGES) {
  ASSET_MAP[key.toLowerCase()] = ELEMENT_IMAGES[key];
}
for (let key in CLASS_IMAGES) {
  ASSET_MAP[key.toLowerCase()] = CLASS_IMAGES[key];
}
for (let key in WEAPON_IMAGES) {
  ASSET_MAP[key.toLowerCase()] = WEAPON_IMAGES[key];
}
for (let key in CUB_IMAGES) {
  ASSET_MAP[key.toLowerCase()] = CUB_IMAGES[key];
}
for (let rusKey in RUS_TO_ENG_MAP) {
  const engKey = RUS_TO_ENG_MAP[rusKey];
  if (ELEMENT_IMAGES[engKey]) ASSET_MAP[rusKey] = ELEMENT_IMAGES[engKey];
  if (CLASS_IMAGES[engKey]) ASSET_MAP[rusKey] = CLASS_IMAGES[engKey];
}
const WEAPON_RESONANCES = [
  { prefix: "AT", name: "Glorious Afterglow", file: "Image/WResonance/AT - Glorious Afterglow.webp" },
  { prefix: "HE", name: "Glorious Spear", file: "Image/WResonance/HE - Glorious Spear.webp" },
  { prefix: "HE", name: "Honed Gel", file: "Image/WResonance/HE - Honed Gel.webp" },
  { prefix: "HE", name: "Peaceful Radiant", file: "Image/WResonance/HE - Peaceful Radiant.webp" },
  { prefix: "HE", name: "Stellar Magnetic Rail", file: "Image/WResonance/HE - Stellar Magnetic Rail.webp" },
  { prefix: "HE", name: "Superconducting Axial Ray", file: "Image/WResonance/HE - Superconducting Axial Ray.webp" },
  { prefix: "TA", name: "Absolute Defense", file: "Image/WResonance/TA - Absolute Defense.webp" },
  { prefix: "TA", name: "Boundaty's Annihilation", file: "Image/WResonance/TA - Boundaty's Annihilation.webp" },
  { prefix: "TA", name: "Domain Deconstuction", file: "Image/WResonance/TA - Domain Deconstuction.webp" },
  { prefix: "TA", name: "Gravity Barrier", file: "Image/WResonance/TA - Gravity Barrier.webp" },
  { prefix: "TA", name: "Resonant Echo", file: "Image/WResonance/TA - Resonant Echo.webp" },
  { prefix: "UN", name: "Incandescence", file: "Image/WResonance/UN - Incandescence.webp" },
  { prefix: "UN", name: "Matrix Lightning", file: "Image/WResonance/UN - Matrix Lightning.webp" },
  { prefix: "UN", name: "Nsec Transmission", file: "Image/WResonance/UN - Nsec Transmission.webp" },
  { prefix: "UN", name: "Shock Echo", file: "Image/WResonance/UN - Shock Echo.webp" },
  { prefix: "UN", name: "Shock Saturation", file: "Image/WResonance/UN - Shock Saturation.webp" },
  { prefix: "UN", name: "Dead Line Timing", file: "Image/WResonance/UN- Dead Line Timing.webp" },
  { prefix: "UNI", name: "Overload Signal", file: "Image/WResonance/UNI - Overload Signal.webp" }
];
const CLASS_TO_PREFIX = {
  "Атакующий": "AT",
  "Танк": "TA",
  "Поддержка": "HE",
  "Амплифаер": "HE",
  "Авангард": "UNI",
  "Наблюдатель": "UN"
  // Special case - universal
};
function createBuild() {
  return {
    title: "",
    mems: ["", "", "", "", "", ""],
    harm: "",
    resTopSlot: "",
    resTopSkill: "",
    resBotSlot: "",
    resBotSkill: "",
    desc: "",
    wRes: [null, null, null]
    // Initialize weapon resonances
  };
}
class AppState {
  // Character Info
  char = "";
  frame = "";
  enFrame = "";
  rank = "";
  // Stats
  element = "-";
  _class = "-";
  get class() {
    return this._class;
  }
  set class(v) {
    this._class = v;
    this.validateResonances();
  }
  validateResonances() {
    const newClass = this._class;
    const allowedPrefix = CLASS_TO_PREFIX[newClass];
    this.builds.forEach((build, bIdx) => {
      if (!build.wRes) return;
      const validRes = build.wRes.filter((res) => {
        if (!res) return false;
        if (res.prefix === "UN") return true;
        if (allowedPrefix === "UNI") return true;
        const isValid = res.prefix === allowedPrefix;
        return isValid;
      });
      const newWRes = [...validRes, null, null, null].slice(0, 3);
      build.wRes = newWRes;
    });
  }
  weapon = "-";
  affix = "-";
  cub = "-";
  // Internal Real Names (for images)
  weaponReal = "";
  cubReal = "";
  // Positioning
  posCode = "";
  // Builds
  builds = [createBuild(), createBuild()];
  // Computed Images
  get charImg() {
    const search = (this.enFrame || this.frame || "").toLowerCase().trim();
    if (!search) return "";
    let img = CHARACTER_IMAGES.find((i) => i.frame.toLowerCase() === search);
    if (!img) img = CHARACTER_IMAGES.find((i) => i.frame.toLowerCase().includes(search));
    return img ? img.file : "";
  }
  get elementImg() {
    return ASSET_MAP[this.element.toLowerCase()] || "";
  }
  get classImg() {
    return ASSET_MAP[this.class.toLowerCase()] || "";
  }
  get weaponImg() {
    return ASSET_MAP[(this.weaponReal || this.weapon).toLowerCase()] || "";
  }
  get affixImg() {
    return ASSET_MAP[this.affix.toLowerCase()] || "";
  }
  get cubImg() {
    return ASSET_MAP[(this.cubReal || this.cub).toLowerCase()] || "";
  }
  constructor() {
  }
  addBuild() {
    this.builds.push(createBuild());
  }
  removeBuild(index) {
    this.builds.splice(index, 1);
  }
  serialize() {
    return {
      char: this.char,
      frame: this.frame,
      enFrame: this.enFrame,
      rank: this.rank,
      element: this.element,
      class: this.class,
      weapon: this.weaponReal || this.weapon,
      affix: this.affix,
      cub: this.cubReal || this.cub,
      posCode: this.posCode,
      builds: snapshot(this.builds)
    };
  }
  hydrate(data) {
    if (!data) return;
    this.char = data.char || "";
    this.frame = data.frame || "";
    this.enFrame = data.enFrame || "";
    this.rank = data.rank || "";
    this.element = data.element || "";
    this.class = data.class || "";
    this.weaponReal = data.weapon || "";
    this.weapon = data.weapon && ASSET_MAP[data.weapon.toLowerCase()] ? "СИГНАТУРНОЕ" : data.weapon || "-";
    this.affix = data.affix || "";
    this.cubReal = data.cub || "";
    this.cub = data.cub && ASSET_MAP[data.cub.toLowerCase()] ? "СИГНАТУРНЫЙ" : data.cub || "-";
    this.posCode = data.posCode || "";
    if (data.builds && Array.isArray(data.builds)) {
      this.builds = data.builds;
    }
  }
  // Modal State
  activeModal = null;
  // 'char', 'mem', 'wres', 'color'
  modalData = null;
  // Extra data for the modal (e.g. which slot)
  openModal(name, data = null) {
    this.activeModal = name;
    this.modalData = data;
  }
  closeModal() {
    this.activeModal = null;
    this.modalData = null;
  }
}
const appState = new AppState();
function TopNav($$renderer, $$props) {
  let { isLightMode = false } = $$props;
  $$renderer.push(`<div class="top-nav"><div class="nav-left"><span>GRAY RAVEN DATABASE</span> // СБОРКА КОНСТРУКТА</div> <div class="nav-right"><button id="theme-toggle" class="btn"${attr_style(`padding: 5px 10px; font-size: 0.7rem; background: ${stringify(isLightMode ? "#fff" : "#000")}; color: ${stringify(isLightMode ? "#000" : "#fff")};`)}>${escape_html(isLightMode ? "DARK MODE" : "LIGHT MODE")}</button> СИСТЕМА: ОНЛАЙН <div class="status-dot"></div></div></div>`);
}
function CharacterPortrait($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let scale = 1;
    let x = 0;
    let y = 0;
    let posCode = `${scale.toFixed(2)}/${Math.round(x)}/${Math.round(y)}`;
    $$renderer2.push(`<div class="portrait-area"${attr_style(`cursor: ${stringify("grab")};`)}>`);
    if (appState.charImg) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<img id="char-img" class="portrait-img"${attr("src", appState.charImg)} alt="Character Portrait"${attr_style(`transform: scale(${stringify(scale)}) translate(${stringify(x)}px, ${stringify(y)}px);`)}/>  <div class="char-change-btn" title="Изменить персонажа">↻</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="portrait-placeholder" id="char-placeholder"><span>+ ВЫБРАТЬ ПЕРСОНАЖА</span> <span style="font-size: 0.7rem; color:#9c9c9c;">НАЖМИ ДЛЯ ВЫБОРА</span></div>`);
    }
    $$renderer2.push(`<!--]-->  <div class="img-controls"><div class="ctl-row"><span>Z</span><input type="range" class="slider" min="0.5" max="2.5" step="0.05"${attr("value", scale)}/></div> <div class="ctl-row"><span>X</span><input type="range" class="slider" min="-150" max="150" step="5"${attr("value", x)}/></div> <div class="ctl-row"><span>Y</span><input type="range" class="slider" min="-150" max="150" step="5"${attr("value", y)}/></div> <div class="ctl-row"><input type="text" placeholder="CODE"${attr("value", posCode)} style="width: 80px; text-align: center; background: #222; border: 1px solid #444; color: #ff3333; font-family: monospace;" title="Код позиции (Scale/X/Y)"/></div></div></div>`);
  });
}
function Combobox($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      value = void 0,
      placeholder = "",
      options = [],
      onSelect,
      showOnFocus = true,
      strict = false,
      class: className,
      $$slots,
      $$events,
      ...rest
    } = $$props;
    options.filter((opt) => {
      const label = typeof opt === "string" ? opt : opt.label;
      return label.toLowerCase().includes((value || "").toLowerCase());
    });
    function focus() {
    }
    function blur() {
    }
    $$renderer2.push(`<div class="combobox-wrapper svelte-1enu51w"><input${attributes(
      {
        type: "text",
        value,
        placeholder,
        class: clsx(className),
        ...rest
      },
      "svelte-1enu51w",
      void 0,
      void 0,
      4
    )}/> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div>`);
    bind_props($$props, { value, focus, blur });
  });
}
function StatsPanel($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const CLASS_OPTIONS = [
      "Атакующий",
      "Поддержка",
      "Танк",
      "Авангард",
      "Амплифаер",
      "Унифрейм"
    ];
    const ELEMENT_OPTIONS = ["Физический", "Огонь", "Лед", "Молния", "Тьма"];
    const RANK_OPTIONS = ["B", "A", "S", "SS", "SSS", "SSS+"];
    const AFFIX_OPTIONS = [
      ...ELEMENT_OPTIONS,
      "Burn",
      "Dark",
      "Fire",
      "Freez",
      "Light",
      "Nihl",
      "Phys",
      "Plasma",
      "Slash",
      "Thunder",
      "Umbra"
    ];
    const WEAPON_OPTIONS = Object.keys(WEAPON_IMAGES).sort();
    const CUB_OPTIONS = Object.keys(CUB_IMAGES).sort();
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<div${attr_class(`stats-container ${stringify(appState.char ? "" : "ui-locked")}`)}><div class="stats-row main-stats-row"><div class="stat-box"><span class="stat-label">КЛАСС</span> `);
      if (appState.classImg) {
        $$renderer3.push("<!--[-->");
        $$renderer3.push(`<img class="stat-icon"${attr("src", appState.classImg)} width="60" height="60" alt="Class"/>`);
      } else {
        $$renderer3.push("<!--[!-->");
      }
      $$renderer3.push(`<!--]--> <div class="combobox-container svelte-1588fz5">`);
      Combobox($$renderer3, {
        class: "stat-input",
        placeholder: "-",
        options: CLASS_OPTIONS,
        get value() {
          return appState.class;
        },
        set value($$value) {
          appState.class = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----></div></div> <div class="stat-box"><span class="stat-label">СТИХИЯ</span> `);
      if (appState.elementImg) {
        $$renderer3.push("<!--[-->");
        $$renderer3.push(`<img class="stat-icon"${attr("src", appState.elementImg)} width="60" height="60" alt="Element"/>`);
      } else {
        $$renderer3.push("<!--[!-->");
      }
      $$renderer3.push(`<!--]--> <div class="combobox-container svelte-1588fz5">`);
      Combobox($$renderer3, {
        class: "stat-input",
        placeholder: "-",
        options: ELEMENT_OPTIONS,
        get value() {
          return appState.element;
        },
        set value($$value) {
          appState.element = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----></div></div> <div class="stat-box"><span class="stat-label">ОРУЖИЕ</span> `);
      if (appState.weaponImg) {
        $$renderer3.push("<!--[-->");
        $$renderer3.push(`<img id="weapon-img" class="stat-icon"${attr("src", appState.weaponImg)} width="60" height="60" alt="Weapon"/>`);
      } else {
        $$renderer3.push("<!--[!-->");
      }
      $$renderer3.push(`<!--]--> <div class="combobox-container svelte-1588fz5">`);
      Combobox($$renderer3, {
        class: "stat-input",
        placeholder: "-",
        options: WEAPON_OPTIONS,
        onSelect: (opt) => {
        },
        get value() {
          return appState.weapon;
        },
        set value($$value) {
          appState.weapon = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----></div></div></div> <div class="stats-row"><div class="stat-box"><span class="stat-label">АФФИКС</span> `);
      if (appState.affixImg) {
        $$renderer3.push("<!--[-->");
        $$renderer3.push(`<img id="affix-img" class="stat-icon"${attr("src", appState.affixImg)} width="60" height="60" alt="Affix"/>`);
      } else {
        $$renderer3.push("<!--[!-->");
      }
      $$renderer3.push(`<!--]--> <div class="combobox-container svelte-1588fz5">`);
      Combobox($$renderer3, {
        class: "stat-input",
        placeholder: "-",
        options: AFFIX_OPTIONS,
        get value() {
          return appState.affix;
        },
        set value($$value) {
          appState.affix = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----></div></div> <div class="stat-box"><span class="stat-label">ПИТОМЕЦ / CUB</span> `);
      if (appState.cubImg) {
        $$renderer3.push("<!--[-->");
        $$renderer3.push(`<img id="cub-img" class="stat-icon"${attr("src", appState.cubImg)} width="60" height="60" alt="CUB"/>`);
      } else {
        $$renderer3.push("<!--[!-->");
      }
      $$renderer3.push(`<!--]--> <div class="combobox-container svelte-1588fz5">`);
      Combobox($$renderer3, {
        class: "stat-input",
        placeholder: "-",
        options: CUB_OPTIONS,
        get value() {
          return appState.cub;
        },
        set value($$value) {
          appState.cub = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----></div></div> <div class="stat-box rank-box"><span class="stat-label">РАНГ</span> <div class="combobox-container svelte-1588fz5">`);
      Combobox($$renderer3, {
        class: "stat-input rank-input",
        placeholder: "-",
        options: RANK_OPTIONS,
        get value() {
          return appState.rank;
        },
        set value($$value) {
          appState.rank = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----></div></div></div></div>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
  });
}
function fillCharacterData(charEntry) {
  if (!charEntry) return;
  appState.char = charEntry.name;
  appState.frame = charEntry.frame;
  appState.enFrame = charEntry.enFrame;
  appState.rank = charEntry.rank || "SSS+";
  appState.element = charEntry.element || "-";
  const newClass = charEntry.class || "-";
  appState.class = newClass;
  if (charEntry.weapon) {
    appState.weaponReal = charEntry.weapon;
    appState.weapon = "СИГНАТУРНОЕ";
  } else {
    appState.weaponReal = "";
    appState.weapon = "-";
  }
  if (charEntry.cub) {
    appState.cubReal = charEntry.cub;
    appState.cub = "СИГНАТУРНЫЙ";
  } else {
    appState.cubReal = "";
    appState.cub = "-";
  }
  appState.affix = charEntry.affix || "-";
}
function LeftPanel($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let nameOptions = CHAR_DATABASE.map((c) => ({
      label: c.frame ? `${c.name}: ${c.frame}` : c.name,
      // Name: Frame or Name
      value: c.name,
      data: c
    }));
    let frameOptions = CHAR_DATABASE.map((c) => ({
      label: c.frame ? `${c.name}: ${c.frame}` : c.name,
      value: c.frame,
      data: c
    }));
    function onNameSelect(opt) {
      if (opt.data) {
        fillCharacterData(opt.data);
      } else {
        appState.char = opt.value || opt;
      }
    }
    function onFrameSelect(opt) {
      if (opt.data) {
        fillCharacterData(opt.data);
      }
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<div class="left-panel">`);
      CharacterPortrait($$renderer3);
      $$renderer3.push(`<!----> <div class="name-plate svelte-1tblt3l"><div class="combobox-container svelte-1tblt3l">`);
      Combobox($$renderer3, {
        class: "char-name-input",
        placeholder: "ИМЯ",
        options: nameOptions,
        onSelect: onNameSelect,
        showOnFocus: false,
        strict: true,
        get value() {
          return appState.char;
        },
        set value($$value) {
          appState.char = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----></div> <div class="combobox-container svelte-1tblt3l">`);
      Combobox($$renderer3, {
        class: "frame-name-input",
        placeholder: "ФРЕЙМ",
        options: frameOptions,
        onSelect: onFrameSelect,
        showOnFocus: false,
        strict: true,
        get value() {
          return appState.frame;
        },
        set value($$value) {
          appState.frame = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----></div></div> `);
      StatsPanel($$renderer3);
      $$renderer3.push(`<!----></div>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
  });
}
function MemorySlot($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { slotIndex, buildIndex } = $$props;
    let memName = appState.builds[buildIndex]?.mems[slotIndex] || "";
    let memImg = memName && MEMORY_NAMES.includes(memName) ? `Image/Memories/Memory-${memName}-Icon-${slotIndex % 3 + 1}.webp` : "";
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<div${attr_class(`mem-cell ${stringify(memName || memImg ? "has-item" : "")} ${stringify("")}`)}><div class="mem-remove-btn">×</div>  <div class="mem-box">`);
      if (memImg) {
        $$renderer3.push("<!--[-->");
        $$renderer3.push(`<img class="mem-img"${attr("src", memImg)}${attr("alt", memName)} draggable="true"/>`);
      } else {
        $$renderer3.push("<!--[!-->");
      }
      $$renderer3.push(`<!--]--></div> <div class="combobox-container svelte-kfxxkx">`);
      Combobox($$renderer3, {
        class: "mem-input",
        placeholder: "МЕМ",
        options: MEMORY_NAMES,
        showOnFocus: false,
        strict: true,
        get value() {
          return appState.builds[buildIndex].mems[slotIndex];
        },
        set value($$value) {
          appState.builds[buildIndex].mems[slotIndex] = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----></div></div>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
  });
}
function RichTextEditor($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { value = "" } = $$props;
    $$renderer2.push(`<div class="rich-editor-container"><div class="rich-textarea" contenteditable="true" role="textbox" tabindex="0" spellcheck="false"></div> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div>`);
    bind_props($$props, { value });
  });
}
function ResonanceSelect($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { value = "" } = $$props;
    const OPTIONS = [
      { val: "", label: "—" },
      { val: "1", label: "1x" },
      { val: "2", label: "2x" },
      { val: "3", label: "3x" },
      { val: "4", label: "4x" },
      { val: "5", label: "5x" },
      { val: "6", label: "6x" }
    ];
    let currentLabel = OPTIONS.find((o) => o.val === value)?.label || "—";
    $$renderer2.push(`<div${attr_class(`custom-res-select ${stringify("")}`)} role="button" tabindex="0"><div class="res-select-trigger">${escape_html(currentLabel)}</div> <div class="res-select-options"><!--[-->`);
    const each_array = ensure_array_like(OPTIONS);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let opt = each_array[$$index];
      $$renderer2.push(`<div${attr_class(`res-select-option ${stringify(value === opt.val ? "selected" : "")}`)} role="option"${attr("aria-selected", value === opt.val)} tabindex="0">${escape_html(opt.label)}</div>`);
    }
    $$renderer2.push(`<!--]--></div></div>`);
    bind_props($$props, { value });
  });
}
function BuildRow($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { build, index } = $$props;
    const RES_SKILL_TOP_OPTIONS = ["+15 АТК", "Red Orb", "Blue Orb", "Yellow Orb"];
    const RES_SKILL_BOTTOM_OPTIONS = ["Core Passive", "Signature Move", "Class Passive"];
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<div class="build-row"><div class="build-title"><span class="build-num">${escape_html((index + 1).toString().padStart(2, "0"))}</span> // <input type="text"${attr("value", build.title)} placeholder="ВВЕДИТЕ НАЗВАНИЕ" autocomplete="off"/></div> <div class="mem-grid"><!--[-->`);
      const each_array = ensure_array_like([0, 1, 2, 3, 4, 5]);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let slotIndex = each_array[$$index];
        MemorySlot($$renderer3, { buildIndex: index, slotIndex });
      }
      $$renderer3.push(`<!--]--></div>  <div${attr_class(`harm-col ${stringify(build.harm ? "has-item" : "")} ${stringify("")}`)}>`);
      if (build.harm && MEMORY_NAMES.includes(build.harm)) {
        $$renderer3.push("<!--[-->");
        $$renderer3.push(`<div class="mem-remove-btn">×</div>`);
      } else {
        $$renderer3.push("<!--[!-->");
      }
      $$renderer3.push(`<!--]-->  <div class="harm-slot"><div class="mem-box">`);
      if (build.harm && MEMORY_NAMES.includes(build.harm)) {
        $$renderer3.push("<!--[-->");
        $$renderer3.push(`<img${attr("src", `Image/Memories/Memory-${build.harm}-Icon-1.webp`)}${attr("alt", build.harm)} draggable="true"/>`);
      } else {
        $$renderer3.push("<!--[!-->");
      }
      $$renderer3.push(`<!--]--></div></div> <div class="combobox-container svelte-1bapz8c">`);
      Combobox($$renderer3, {
        class: "harm-input",
        placeholder: "ГАРМ",
        options: MEMORY_NAMES,
        showOnFocus: false,
        strict: true,
        get value() {
          return build.harm;
        },
        set value($$value) {
          build.harm = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----></div></div> <div class="res-col"><div class="res-group"><div class="res-label">ВЕРХ. РЕЗОНАНС</div> <div class="res-row">`);
      ResonanceSelect($$renderer3, {
        get value() {
          return build.resTopSlot;
        },
        set value($$value) {
          build.resTopSlot = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> <div class="combobox-container res-combobox svelte-1bapz8c">`);
      Combobox($$renderer3, {
        class: "res-skill-input",
        placeholder: "НАВЫК",
        options: RES_SKILL_TOP_OPTIONS,
        get value() {
          return build.resTopSkill;
        },
        set value($$value) {
          build.resTopSkill = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----></div></div></div> <div class="res-group"><div class="res-label">НИЖН. РЕЗОНАНС</div> <div class="res-row">`);
      ResonanceSelect($$renderer3, {
        get value() {
          return build.resBotSlot;
        },
        set value($$value) {
          build.resBotSlot = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> <div class="combobox-container res-combobox svelte-1bapz8c">`);
      Combobox($$renderer3, {
        class: "res-skill-input",
        placeholder: "НАВЫК",
        options: RES_SKILL_BOTTOM_OPTIONS,
        get value() {
          return build.resBotSkill;
        },
        set value($$value) {
          build.resBotSkill = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----></div></div></div> <div class="weapon-res-group"><div class="res-label">РЕЗОНАНСЫ ОРУЖИЯ</div> <div class="weapon-res-row"><!--[-->`);
      const each_array_1 = ensure_array_like([0, 1, 2]);
      for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
        let wIndex = each_array_1[$$index_1];
        $$renderer3.push(`<div${attr_class(`weapon-res-cell ${stringify(build.wRes && build.wRes[wIndex] ? "has-item" : "")}`)}>`);
        if (build.wRes && build.wRes[wIndex]) {
          $$renderer3.push("<!--[-->");
          $$renderer3.push(`<div class="mem-remove-btn">×</div>`);
        } else {
          $$renderer3.push("<!--[!-->");
        }
        $$renderer3.push(`<!--]--> <div class="weapon-res-box">`);
        if (build.wRes && build.wRes[wIndex]) {
          $$renderer3.push("<!--[-->");
          $$renderer3.push(`<img${attr("src", build.wRes[wIndex].file)}${attr("alt", build.wRes[wIndex].name)}/>`);
        } else {
          $$renderer3.push("<!--[!-->");
        }
        $$renderer3.push(`<!--]--></div></div>`);
      }
      $$renderer3.push(`<!--]--></div></div></div> <div class="tac-box"><div class="tac-header">ТАКТИЧЕСКИЙ АНАЛИЗ</div> <div class="rich-editor-container">`);
      RichTextEditor($$renderer3, {
        get value() {
          return build.desc;
        },
        set value($$value) {
          build.desc = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----></div></div>  <div class="btn-del">×</div></div>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
  });
}
function BuildList($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    $$renderer2.push(`<div id="builds-container" class="svelte-kkbj6g"><!--[-->`);
    const each_array = ensure_array_like(appState.builds);
    for (let index = 0, $$length = each_array.length; index < $$length; index++) {
      let build = each_array[index];
      $$renderer2.push(`<div>`);
      BuildRow($$renderer2, { build, index });
      $$renderer2.push(`<!----></div>`);
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
function RightPanel($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    $$renderer2.push(`<div${attr_class(`right-panel ${stringify(appState.char ? "" : "ui-locked")}`, "svelte-1l7uo6c")}><div class="section-header svelte-1l7uo6c"><span>КОНФИГУРАЦИЯ ПАМЯТИ</span></div> `);
    BuildList($$renderer2);
    $$renderer2.push(`<!----> <div class="add-build-area svelte-1l7uo6c"><button id="add-build-btn-wide" class="add-build-wide-btn svelte-1l7uo6c">+ ДОБАВИТЬ СЕТ</button></div></div>`);
  });
}
function MemoryModal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let searchQuery = "";
    let activeSlotIndex = (() => {
      if (!appState.modalData) return 1;
      if (appState.modalData.slotIndex !== void 0) {
        return appState.modalData.slotIndex % 3 + 1;
      }
      return 1;
    })();
    let memoryList = (() => {
      const lowerQ = searchQuery.toLowerCase();
      return MEMORY_NAMES.filter((name) => name.toLowerCase().includes(lowerQ)).map((name) => ({
        name,
        file: `Image/Memories/Memory-${name}-Icon-${activeSlotIndex}.webp`
      }));
    })();
    if (appState.activeModal === "mem") {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="modal-overlay"><div class="modal-content modal-mem"><div class="modal-header"><h3>ВЫБОР ВОСПОМИНАНИЯ (СЛОТ ${escape_html(activeSlotIndex)})</h3> <button class="modal-close">X</button></div> <input type="text" class="modal-search"${attr("value", searchQuery)} placeholder="ПОИСК..."/> <div class="modal-grid"><!--[-->`);
      const each_array = ensure_array_like(memoryList);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let mem = each_array[$$index];
        $$renderer2.push(`<div class="mem-option"><img class="mem-opt-img"${attr("src", mem.file)}${attr("alt", mem.name)} onerror="this.__e=event"/> <span>${escape_html(mem.name)}</span></div>`);
      }
      $$renderer2.push(`<!--]--></div></div></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
  });
}
function CharacterModal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let searchQuery = "";
    let charList = [];
    if (appState.activeModal === "char") {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="modal-overlay"><div class="modal-content modal-char"><div class="modal-header"><h3>ВЫБОР ПЕРСОНАЖА</h3> <button class="modal-close">X</button></div> <input type="text" class="modal-search"${attr("value", searchQuery)} placeholder="ПОИСК..."/> <div class="modal-grid"><!--[-->`);
      const each_array = ensure_array_like(charList);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let char = each_array[$$index];
        $$renderer2.push(`<div class="modal-item"><img${attr("src", char.file)}${attr("alt", char.frame)} loading="lazy"/> <span>${escape_html(char.label)}</span></div>`);
      }
      $$renderer2.push(`<!--]--></div></div></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
  });
}
function WeaponResonanceModal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let availableResonances = (() => {
      const charClass = appState.class || "";
      const prefix = CLASS_TO_PREFIX[charClass];
      return WEAPON_RESONANCES.filter((res) => {
        if (res.prefix === "UN") return true;
        if (!prefix) return true;
        if (prefix === "UNI") return true;
        return res.prefix === prefix;
      });
    })();
    if (appState.activeModal === "wres") {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="modal-overlay"><div class="wres-modal-content"><div class="modal-header"><h3>ВЫБОР РЕЗОНАНСА ОРУЖИЯ</h3> <button class="modal-close">X</button></div> <div class="wres-grid"><!--[-->`);
      const each_array = ensure_array_like(availableResonances);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let res = each_array[$$index];
        $$renderer2.push(`<div class="wres-item"><img${attr("src", res.file)}${attr("alt", res.name)}/> <span>${escape_html(res.name)}</span></div>`);
      }
      $$renderer2.push(`<!--]--></div></div></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
  });
}
function ColorPicker($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let h = 0;
    let s = 0;
    let v = 100;
    let recentColors = ["#FFFFFF", "#FF0000", "#00FF00", "#0000FF"];
    let hexInput = "#FFFFFF";
    let currentColor = hsvToHex(h, s, v);
    let hueColor = `hsl(${h}, 100%, 50%)`;
    let cursorLeft = `${s}%`;
    let cursorTop = `${100 - v}%`;
    let r = 255;
    let g = 255;
    let b = 255;
    function hsvToHex(h2, s2, v2) {
      s2 /= 100;
      v2 /= 100;
      let c = v2 * s2;
      let x = c * (1 - Math.abs(h2 / 60 % 2 - 1));
      let m = v2 - c;
      let r2 = 0, g2 = 0, b2 = 0;
      {
        r2 = c;
        g2 = x;
        b2 = 0;
      }
      r2 = Math.round((r2 + m) * 255);
      g2 = Math.round((g2 + m) * 255);
      b2 = Math.round((b2 + m) * 255);
      return `#${r2.toString(16).padStart(2, "0")}${g2.toString(16).padStart(2, "0")}${b2.toString(16).padStart(2, "0")}`.toUpperCase();
    }
    if (
      // ...
      appState.activeModal === "color"
    ) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="modal-backdrop svelte-gk8ago"><div class="modal-content svelte-gk8ago"><div class="modal-header svelte-gk8ago">ВЫБОР ЦВЕТА</div> <div class="cp-container"><div class="cp-sat-box svelte-gk8ago"${attr_style(`background-color: ${stringify(hueColor)};`)}><div class="cp-white svelte-gk8ago"></div> <div class="cp-black svelte-gk8ago"></div> <div class="cp-cursor svelte-gk8ago"${attr_style(`left: ${stringify(cursorLeft)}; top: ${stringify(cursorTop)};`)}></div></div> <input type="range" min="0" max="360" class="cp-hue-slider svelte-gk8ago"${attr("value", h)}/> <div class="cp-controls"><div class="cp-row svelte-gk8ago"><input type="text" class="cp-hex-input svelte-gk8ago"${attr("value", hexInput)} readonly=""/> <div class="cp-preview svelte-gk8ago"${attr_style(`background-color: ${stringify(currentColor)};`)}></div> <button class="btn svelte-gk8ago">APPLY</button></div> <div class="cp-rgb-row svelte-gk8ago"><div class="cp-col svelte-gk8ago"><span>R</span> <input type="number" min="0" max="255" class="cp-num-input svelte-gk8ago"${attr("value", r)}/></div> <div class="cp-col svelte-gk8ago"><span>G</span> <input type="number" min="0" max="255" class="cp-num-input svelte-gk8ago"${attr("value", g)}/></div> <div class="cp-col svelte-gk8ago"><span>B</span> <input type="number" min="0" max="255" class="cp-num-input svelte-gk8ago"${attr("value", b)}/></div> <div class="cp-col svelte-gk8ago"><span style="opacity:0">.</span></div></div></div> <div class="cp-recent svelte-gk8ago"><!--[-->`);
      const each_array = ensure_array_like(recentColors);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let col = each_array[$$index];
        $$renderer2.push(`<div class="recent-swatch svelte-gk8ago"${attr_style(`background-color: ${stringify(col)};`)}></div>`);
      }
      $$renderer2.push(`<!--]--></div></div></div></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
  });
}
function SettingsModal($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let isOpen = false;
    let charWidth = 1e3;
    let memWidth = 1e3;
    let wresWidth = 1200;
    let wresCols = 8;
    function open() {
      isOpen = true;
      loadSettings();
    }
    function loadSettings() {
      const stored = localStorage.getItem("pgr-builder-settings-v5");
      if (stored) {
        const data = JSON.parse(stored);
        charWidth = data.charWidth || 1e3;
        memWidth = data.memWidth || 1e3;
        wresWidth = data.wresWidth || 1200;
        wresCols = data.wresCols || 8;
      }
      applySettings();
    }
    function applySettings() {
      const root = document.documentElement;
      root.style.setProperty("--modal-width-char", `${charWidth}px`);
      root.style.setProperty("--modal-width-mem", `${memWidth}px`);
      root.style.setProperty("--modal-width-wres", `${wresWidth}px`);
      root.style.setProperty("--wres-cols", wresCols);
    }
    if (isOpen) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="modal-overlay"><div class="modal-content settings-modal svelte-1jcdij9"><div class="modal-header"><h3>НАСТРОЙКИ ИНТЕРФЕЙСА</h3> <button class="modal-close">X</button></div> <div class="settings-body svelte-1jcdij9"><div class="setting-group svelte-1jcdij9"><label for="charWidth" class="svelte-1jcdij9">Ширина окна персонажей: <span class="val svelte-1jcdij9">${escape_html(charWidth)}px</span></label> <input id="charWidth" type="range" min="500" max="1800" step="50"${attr("value", charWidth)} class="svelte-1jcdij9"/></div> <div class="setting-group svelte-1jcdij9"><label for="memWidth" class="svelte-1jcdij9">Ширина окна памяти: <span class="val svelte-1jcdij9">${escape_html(memWidth)}px</span></label> <input id="memWidth" type="range" min="500" max="1800" step="50"${attr("value", memWidth)} class="svelte-1jcdij9"/></div> <div class="setting-group svelte-1jcdij9"><div class="group-title svelte-1jcdij9">Окно резонанса оружия</div> <label for="wresWidth" class="svelte-1jcdij9">Ширина: <span class="val svelte-1jcdij9">${escape_html(wresWidth)}px</span></label> <input id="wresWidth" type="range" min="100" max="1800" step="10"${attr("value", wresWidth)} class="svelte-1jcdij9"/> <label for="wresCols" class="svelte-1jcdij9">Количество колонок: <span class="val svelte-1jcdij9">${escape_html(wresCols)}</span></label> <input id="wresCols" type="range" min="2" max="14" step="1"${attr("value", wresCols)} class="svelte-1jcdij9"/></div> <div class="actions svelte-1jcdij9"><button class="btn">СБРОСИТЬ</button> <button class="btn save-btn svelte-1jcdij9">ГОТОВО</button></div></div></div></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, { open });
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let isLightMode = false;
    let saveBtnState = { text: "СОЗДАТЬ ССЫЛКУ" };
    TopNav($$renderer2, { isLightMode });
    $$renderer2.push(`<!----> <div class="app-container"><div class="page-corner pc-tl"></div> <div class="page-corner pc-tr"></div> <div class="page-corner pc-bl"></div> <div class="page-corner pc-br"></div> `);
    LeftPanel($$renderer2);
    $$renderer2.push(`<!----> `);
    RightPanel($$renderer2);
    $$renderer2.push(`<!----></div> <div class="ctrl-panel"><button${attr_class(`btn btn-save ${stringify("")}`)}>${escape_html(saveBtnState.text)}</button> <button class="btn">НАСТРОЙКИ</button> <button class="btn">СОХРАНИТЬ (PNG)</button></div> `);
    MemoryModal($$renderer2);
    $$renderer2.push(`<!----> `);
    CharacterModal($$renderer2);
    $$renderer2.push(`<!----> `);
    WeaponResonanceModal($$renderer2);
    $$renderer2.push(`<!----> `);
    ColorPicker($$renderer2);
    $$renderer2.push(`<!----> `);
    SettingsModal($$renderer2, {});
    $$renderer2.push(`<!---->`);
  });
}
export {
  _page as default
};
