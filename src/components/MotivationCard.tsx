import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  AppState,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { motivationService, MotivationData } from '../services/motivationService';
import { soundService } from '../services/soundService';
import * as Haptics from 'expo-haptics';

const { width: screenWidth } = Dimensions.get('window');

interface MotivationCardProps {
  userId?: string;
  onDismiss?: () => void;
  autoShow?: boolean;
  delay?: number;
}

export default function MotivationCard({ 
  userId, 
  onDismiss, 
  autoShow = true, 
  delay = 2000 
}: MotivationCardProps) {
  const { currentTheme } = useTheme();
  const { t } = useLanguage();

  // Translation map for motivation titles and messages - using message ID for i18n keys
  const getTranslatedTitle = (title: string, messageId?: string) => {
    // Use message ID to get i18n key if available
    if (messageId) {
      const idToKeyMap: { [key: string]: string } = {
        'mood_excellent_week': 'motivation.titles.shiningBrightly',
        'mood_good_week': 'motivation.titles.peacefulSoul',
        'mood_encouragement': 'motivation.titles.newBeginning',
        'goal_almost_there': 'motivation.titles.closeToDreams',
        'goal_good_progress': 'motivation.titles.halfwayThere',
        'streak_amazing': 'motivation.titles.legend',
        'streak_good': 'motivation.titles.amazingRhythm',
        'general_encouragement_1': 'motivation.titles.innerLightShining',
        'general_encouragement_2': 'motivation.titles.strongerEveryDay',
        'reflection_insight': 'motivation.titles.listenToFeelings',
        'gratitude_practice': 'motivation.titles.lifeSmiling',
        'emotional_awareness': 'motivation.titles.valueFeelings',
        'growth_mindset': 'motivation.titles.growingSoul',
        'self_compassion': 'motivation.titles.beKind',
        'self_compassion_2': 'motivation.titles.beCompassionate',
        'self_compassion_3': 'motivation.titles.dontJudgeYourself',
        'self_compassion_4': 'motivation.titles.takeCareOfYourself',
        'self_compassion_5': 'motivation.titles.beAtPeaceWithYourself',
        'self_compassion_6': 'motivation.titles.acceptYourselfAsYouAre',
        'self_compassion_7': 'motivation.titles.giveYourselfTime',
        'self_compassion_8': 'motivation.titles.loveYourselfHabit',
        'self_compassion_9': 'motivation.titles.giveYourselfPermission',
        'self_compassion_10': 'motivation.titles.listenToYourself',
        'self_compassion_11': 'motivation.titles.showCompassionToYourself',
        'self_compassion_12': 'motivation.titles.forgiveYourself',
        'self_compassion_13': 'motivation.titles.valueYourself',
        'self_compassion_14': 'motivation.titles.bePatientWithYourself',
        'self_compassion_15': 'motivation.titles.dontExhaustYourself',
        'self_compassion_16': 'motivation.titles.talkToYourself',
        'self_compassion_17': 'motivation.titles.trustYourself',
        'self_compassion_18': 'motivation.titles.hugYourself',
        'self_compassion_19': 'motivation.titles.beGoodToYourself',
        'self_compassion_20': 'motivation.titles.prioritizeYourself',
        'self_compassion_21': 'motivation.titles.beMercifulToYourself',
        'self_compassion_22': 'motivation.titles.nourishYourself',
        'self_compassion_23': 'motivation.titles.beGratefulToYourself',
        'self_compassion_24': 'motivation.titles.believeInYourself',
        'self_compassion_25': 'motivation.titles.approveYourself',
        'self_compassion_26': 'motivation.titles.giveYourselfChance',
        'self_compassion_27': 'motivation.titles.listenToYourselfMusic',
        'self_compassion_28': 'motivation.titles.thankYourself',
        'self_compassion_29': 'motivation.titles.rewardYourself',
        'self_compassion_30': 'motivation.titles.respectYourself',
        'self_compassion_31': 'motivation.titles.understandYourself',
        'self_compassion_32': 'motivation.titles.supportYourself',
        'self_compassion_33': 'motivation.titles.nourishYourselfFood',
        'self_compassion_34': 'motivation.titles.inspireYourself',
        'self_compassion_35': 'motivation.titles.hugYourselfBlue',
        'future_planning': 'motivation.titles.brightTomorrow',
        'energy_awareness': 'motivation.titles.valuableEnergy',
        'communication_skills': 'motivation.titles.connectionsEmpower',
        'accomplishment_celebration': 'motivation.titles.celebrateSuccess',
        'mindful_living': 'motivation.titles.liveMoment',
        'peace_within': 'motivation.titles.innerPeace',
        'self_love': 'motivation.titles.loveYourself',
        'beautiful_soul': 'motivation.titles.beautifulSoul',
        'breathe_relax': 'motivation.titles.breatheRelax',
        'smile_today': 'motivation.titles.smile',
      };
      
      const i18nKey = idToKeyMap[messageId];
      if (i18nKey) {
        const translated = t(i18nKey);
        // Always return translated value, even if it's the same as key (means translation exists but might be same)
        // Only fallback if translation key doesn't exist at all
        if (translated && translated !== i18nKey) {
          return translated;
        }
        // If translation exists but is same as key, still use it (it's a valid translation)
        if (translated) {
          return translated;
        }
      }
    }
    
    // Fallback to string-based translation
    const translations: { [key: string]: string } = {
      'Her Gün Yeni Bir Başlangıç! 🌅': t('motivation.titles.newBeginning'),
      'Hayallerine Çok Yakınsın! ✨': t('motivation.titles.closeToDreams'),
      'Yolun Yarısını Geçtin! 🌈': t('motivation.titles.passedHalfway'),
      'Duygularını Dinlemek Güzel! 🎵': t('motivation.titles.listenToFeelings'),
      'Işıl Işıl Parlıyorsun! ✨': t('motivation.titles.shiningBrightly'),
      'Ruhun Huzurlu! 🌸': t('motivation.titles.peacefulSoul'),
      'Sen Bir Efsanesin! 🔥': t('motivation.titles.legend'),
      'Harika Bir Ritm! ⭐': t('motivation.titles.amazingRhythm'),
      'İçindeki Işık Parlıyor! ✨': t('motivation.titles.innerLightShining'),
      'Her Gün Daha Güçlüsün! 🌱': t('motivation.titles.strongerEveryDay'),
      'Hayat Sana Gülüyor! 🌻': t('motivation.titles.lifeSmiling'),
      'Duygularına Değer Ver! 💖': t('motivation.titles.valueFeelings'),
      'Büyüyen Bir Ruh! 🦋': t('motivation.titles.growingSoul'),
      'Kendine Nazik Ol! 🌸': t('motivation.titles.beKind'),
      'Kendine Şefkatli Ol! 💝': t('motivation.titles.beCompassionate'),
      'Kendini Yargılama! 🕊️': t('motivation.titles.dontJudgeYourself'),
      'Kendine İyi Bak! 🌺': t('motivation.titles.takeCareOfYourself'),
      'Kendinle Barışık Ol! ✨': t('motivation.titles.beAtPeaceWithYourself'),
      'Kendini Olduğun Gibi Kabul Et! 🤲': t('motivation.titles.acceptYourselfAsYouAre'),
      'Kendine Zaman Ver! ⏰': t('motivation.titles.giveYourselfTime'),
      'Kendini Sev! 💕': t('motivation.titles.loveYourselfHabit'),
      'Kendine İzin Ver! 🌈': t('motivation.titles.giveYourselfPermission'),
      'Kendini Dinle! 🎧': t('motivation.titles.listenToYourself'),
      'Kendine Şefkat Göster! 💝': t('motivation.titles.showCompassionToYourself'),
      'Kendini Affet! 🤲': t('motivation.titles.forgiveYourself'),
      'Kendine Değer Ver! 💎': t('motivation.titles.valueYourself'),
      'Kendine Sabırlı Ol! ⏳': t('motivation.titles.bePatientWithYourself'),
      'Kendini Yorma! 😌': t('motivation.titles.dontExhaustYourself'),
      'Kendinle Konuş! 💬': t('motivation.titles.talkToYourself'),
      'Kendine Güven! 🌟': t('motivation.titles.trustYourself'),
      'Kendini Kucakla! 🤗': t('motivation.titles.hugYourself'),
      'Kendine İyi Davran! 🌸': t('motivation.titles.beGoodToYourself'),
      'Kendini Önemse! 💖': t('motivation.titles.prioritizeYourself'),
      'Kendine Merhametli Ol! 🕊️': t('motivation.titles.beMercifulToYourself'),
      'Kendini Besle! 🌱': t('motivation.titles.nourishYourself'),
      'Kendine Şükret! 🙏': t('motivation.titles.beGratefulToYourself'),
      'Kendine İnan! ✨': t('motivation.titles.believeInYourself'),
      'Kendini Onayla! ✅': t('motivation.titles.approveYourself'),
      'Kendine Şans Ver! 🍀': t('motivation.titles.giveYourselfChance'),
      'Kendini Dinle! 🎵': t('motivation.titles.listenToYourselfMusic'),
      'Kendine Teşekkür Et! 🙏': t('motivation.titles.thankYourself'),
      'Kendini Ödüllendir! 🎁': t('motivation.titles.rewardYourself'),
      'Kendine Saygı Göster! 👑': t('motivation.titles.respectYourself'),
      'Kendini Anla! 💭': t('motivation.titles.understandYourself'),
      'Kendine Destek Ol! 🤝': t('motivation.titles.supportYourself'),
      'Kendini Besle! 🍎': t('motivation.titles.nourishYourselfFood'),
      'Kendine İlham Ver! ✨': t('motivation.titles.inspireYourself'),
      'Kendini Kucakla! 💙': t('motivation.titles.hugYourselfBlue'),
      'Yarınların Parlak! 🌅': t('motivation.titles.brightTomorrow'),
      'Enerjin Çok Değerli! 💫': t('motivation.titles.valuableEnergy'),
      'Her Başarı Kutlanmalı! 🎊': t('motivation.titles.celebrateSuccess'),
      'Anı Yaşa! 🌺': t('motivation.titles.liveMoment'),
      'İçsel Huzur! 🕊️': t('motivation.titles.innerPeace'),
      'Güzel Bir Ruhsun! 🌟': t('motivation.titles.beautifulSoul'),
      'Nefes Al, Rahatla! 🌬️': t('motivation.titles.breatheRelax'),
      'Gülümse! 😊': t('motivation.titles.smile'),
      'Connections Empower You! 🤝': t('motivation.titles.connectionsEmpower'),
    };
    return translations[title] || title;
  };

  const getTranslatedMessage = (message: string, messageId?: string) => {
    // Use message ID to get i18n key if available
    if (messageId) {
      const idToKeyMap: { [key: string]: string } = {
        'mood_excellent_week': 'motivation.messages.strongLight',
        'mood_good_week': 'motivation.messages.beautifulEnergy',
        'mood_encouragement': 'motivation.messages.cloudsAndSun',
        'goal_almost_there': 'motivation.messages.lookHowFar',
        'goal_good_progress': 'motivation.messages.smallSteps',
        'streak_amazing': 'motivation.messages.valueYourself',
        'streak_good': 'motivation.messages.regularTime',
        'general_encouragement_1': 'motivation.messages.nourishSoul',
        'general_encouragement_2': 'motivation.messages.strongerEveryDay',
        'reflection_insight': 'motivation.messages.listenToVoice',
        'gratitude_practice': 'motivation.messages.gratitudePractice',
        'emotional_awareness': 'motivation.messages.emotionalAwareness',
        'growth_mindset': 'motivation.messages.growthMindset',
        'self_compassion': 'motivation.messages.treatYourselfAsYouWould',
        'self_compassion_2': 'motivation.messages.beCompassionateToYourselfExtended',
        'self_compassion_3': 'motivation.messages.acceptYourselfWithoutJudgment',
        'self_compassion_4': 'motivation.messages.howKindToYourselfToday',
        'self_compassion_5': 'motivation.messages.beAtPeaceYourselfToday',
        'self_compassion_6': 'motivation.messages.acceptYourselfEnough',
        'self_compassion_7': 'motivation.messages.giveYourselfTime',
        'self_compassion_8': 'motivation.messages.lovingYourselfBeautifulHabit',
        'self_compassion_9': 'motivation.messages.giveYourselfPermission',
        'self_compassion_10': 'motivation.messages.listenToYourselfExtended',
        'self_compassion_11': 'motivation.messages.showCompassionToYourself',
        'self_compassion_12': 'motivation.messages.forgiveYourself',
        'self_compassion_13': 'motivation.messages.valueYourselfExtended',
        'self_compassion_14': 'motivation.messages.bePatientWithYourself',
        'self_compassion_15': 'motivation.messages.justBreathingEnough',
        'self_compassion_16': 'motivation.messages.talkingToYourselfMostValuable',
        'self_compassion_17': 'motivation.messages.trustYourselfExtended',
        'self_compassion_18': 'motivation.messages.hugYourself',
        'self_compassion_19': 'motivation.messages.beGoodToYourself',
        'self_compassion_20': 'motivation.messages.prioritizeYourself',
        'self_compassion_21': 'motivation.messages.beMercifulToYourself',
        'self_compassion_22': 'motivation.messages.nourishYourself',
        'self_compassion_23': 'motivation.messages.beGratefulToYourself',
        'self_compassion_24': 'motivation.messages.believeInYourselfExtended',
        'self_compassion_25': 'motivation.messages.approveYourself',
        'self_compassion_26': 'motivation.messages.giveYourselfChance',
        'self_compassion_27': 'motivation.messages.listenToYourselfMusic',
        'self_compassion_28': 'motivation.messages.thankYourself',
        'self_compassion_29': 'motivation.messages.rewardYourself',
        'self_compassion_30': 'motivation.messages.respectYourself',
        'self_compassion_31': 'motivation.messages.understandYourself',
        'self_compassion_32': 'motivation.messages.supportYourself',
        'self_compassion_33': 'motivation.messages.nourishYourselfFood',
        'self_compassion_34': 'motivation.messages.inspireYourself',
        'self_compassion_35': 'motivation.messages.hugYourselfBlue',
        'future_planning': 'motivation.messages.futurePlanning',
        'energy_awareness': 'motivation.messages.energyAwareness',
        'communication_skills': 'motivation.messages.communicationSkills',
        'accomplishment_celebration': 'motivation.messages.accomplishmentCelebration',
        'mindful_living': 'motivation.messages.mindfulLiving',
        'peace_within': 'motivation.messages.peaceWithin',
        'self_love': 'motivation.messages.selfLove',
        'beautiful_soul': 'motivation.messages.beautifulSoul',
        'breathe_relax': 'motivation.messages.breatheRelax',
        'smile_today': 'motivation.messages.smileToday',
      };
      
      const i18nKey = idToKeyMap[messageId];
      if (i18nKey) {
        const translated = t(i18nKey);
        if (translated !== i18nKey) return translated; // Only return if translation exists
      }
    }
    
    // Fallback to string-based translation
    const translations: { [key: string]: string } = {
      'Bazen bulutlar güneşi örter ama güneş hep oradadır. Senin içindeki ışık da öyle. Bugün daha güzel olacak!': t('motivation.messages.cloudsAndSun'),
      'Bak ne kadar yol kattettin! Her adım seni daha güçlü yapıyor. Devam et, sen harikasın!': t('motivation.messages.lookHowFar'),
      'Her küçük adım büyük değişimlerin başlangıcı. Sen harika şeyler başarıyorsun!': t('motivation.messages.smallSteps'),
      'İçindeki sese kulak vermek seni daha huzurlu yapıyor. Kendini dinlemeye devam et!': t('motivation.messages.listenToVoice'),
      'Bu hafta içindeki ışık öyle güçlü ki, etrafına pozitif enerji saçıyorsun. Kendini hissettiğin gibi yaşamaya devam et!': t('motivation.messages.strongLight'),
      'İçindeki o güzel enerji çok değerli. Hayatın sana sunduğu bu güzel anları doya doya yaşa!': t('motivation.messages.beautifulEnergy'),
      'Kendine verdiğin değere bak! Her gün kendine zaman ayırman ne kadar güzel. Gurur duymalısın!': t('motivation.messages.valueYourself'),
      'Kendine düzenli zaman ayırmak en güzel hediye. Sen çok değerlisin ve bunu hak ediyorsun!': t('motivation.messages.regularTime'),
      'Kendine ayırdığın her an, ruhunu besliyor. Sen çok özelsin ve bunu unutma!': t('motivation.messages.nourishSoul'),
      'En sevdiğin insana davrandığın gibi kendine de davran. Sen de şefkat hak ediyorsun!': t('motivation.messages.treatYourselfAsYouWould'),
      'Kendine şefkatli ol! Sen insansın ve hata yapmak normal. Kendini affetmeyi öğren!': t('motivation.messages.beCompassionateToYourselfExtended'),
      'Kendini yargılamadan kabul et! Sen mükemmel olmak zorunda değilsin, sadece kendin olman yeterli!': t('motivation.messages.acceptYourselfWithoutJudgment'),
      'Bugün kendine ne kadar nazik davranacaksın? Unutma, sen de sevgi ve şefkat hak ediyorsun!': t('motivation.messages.howKindToYourselfToday'),
      'Bugün de kendinle barışık ol! Her gün aynı enerjide olmak zorunda değilsin, bu normal!': t('motivation.messages.beAtPeaceYourselfToday'),
      'Kendini olduğun gibi kabul et! Sen yeterlisin ve mükemmel olmak zorunda değilsin!': t('motivation.messages.acceptYourselfEnough'),
      'Kendine zaman ver! Her şey yerli yerine gelecek. Sabırlı ol, sen harikasın!': t('motivation.messages.giveYourselfTime'),
      'Kendini sevmek, en güzel alışkanlık! Bugün de kendine sevgiyle yaklaş, sen özelsin!': t('motivation.messages.lovingYourselfBeautifulHabit'),
      'Kendine izin ver! Dinlenmek, hata yapmak, zorlanmak hepsi normal. Sen insansın!': t('motivation.messages.giveYourselfPermission'),
      'Kendini dinle! İhtiyacın olan şey ne? Bazen sadece dinlenmek yeterli. Sen değerlisin!': t('motivation.messages.listenToYourselfExtended'),
      'Kendine şefkat göster! En zor günlerinde bile kendinle nazik ol. Sen bunu hak ediyorsun!': t('motivation.messages.showCompassionToYourself'),
      'Kendini affet! Geçmiş hatalar seni tanımlamaz. Her gün yeni bir başlangıç!': t('motivation.messages.forgiveYourself'),
      'Kendine değer ver! Sen özelsin ve bu dünyada bir tanesin. Kendini olduğun gibi sev!': t('motivation.messages.valueYourselfExtended'),
      'Kendine sabırlı ol! Her şey zamanında olur. Sen zaten harika birisin!': t('motivation.messages.bePatientWithYourself'),
      'Kendini yorma! Bugün sadece nefes almak bile yeter. Sen zaten yeterince iyisin!': t('motivation.messages.justBreathingEnough'),
      'Kendinle konuş! En değerli sohbet kendinle olan sohbet. Kendini dinle ve anla!': t('motivation.messages.talkingToYourselfMostValuable'),
      'Kendine güven! Sen yapabilirsin. İçindeki güç sandığından çok daha büyük!': t('motivation.messages.trustYourselfExtended'),
      'Kendini kucakla! Bugün zorlanıyorsan bu normal. Kendine sarıl, sen değerlisin!': t('motivation.messages.hugYourself'),
      'Kendine iyi davran! En sevdiğin insana gösterdiğin sevgiyi kendine de göster. Sen hak ediyorsun!': t('motivation.messages.beGoodToYourself'),
      'Kendini önemse! Senin ihtiyaçların da önemli. Kendine öncelik vermekten çekinme!': t('motivation.messages.prioritizeYourself'),
      'Kendine merhametli ol! Hata yapmak insan olmanın bir parçası. Kendini affetmeyi öğren!': t('motivation.messages.beMercifulToYourself'),
      'Kendini besle! Hem bedenini hem ruhunu. Kendine iyi bakmak bir öz-sevgi eylemidir!': t('motivation.messages.nourishYourself'),
      'Kendine şükret! Bugün burada olman, nefes alman bile bir nimet. Kendini takdir et!': t('motivation.messages.beGratefulToYourself'),
      'Kendine inan! Sen yapabilirsin. İçindeki potansiyel sınırsız. Kendine güven!': t('motivation.messages.believeInYourselfExtended'),
      'Kendini onayla! Sen yeterlisin, sen değerlisin, sen özelsin. Bunu kendine hatırlat!': t('motivation.messages.approveYourself'),
      'Kendine şans ver! Her gün yeni bir fırsat. Bugün de kendin için bir şey yap!': t('motivation.messages.giveYourselfChance'),
      'Kendini dinle! İç sesin sana ne söylüyor? Ona kulak ver, seni yönlendirecek!': t('motivation.messages.listenToYourselfMusic'),
      'Kendine teşekkür et! Bugüne kadar geldiğin için, ayakta kaldığın için. Sen güçlüsün!': t('motivation.messages.thankYourself'),
      'Kendini ödüllendir! Küçük başarıların bile kutlanmayı hak ediyor. Sen harikasın!': t('motivation.messages.rewardYourself'),
      'Kendine saygı göster! Sen değerlisin ve saygıyı hak ediyorsun. Önce kendinden başla!': t('motivation.messages.respectYourself'),
      'Kendini anla! Duyguların, düşüncelerin hepsi geçerli. Kendini yargılamadan kabul et!': t('motivation.messages.understandYourself'),
      'Kendine destek ol! En zor zamanlarında bile kendin yanında ol. Sen yalnız değilsin!': t('motivation.messages.supportYourself'),
      'Kendini besle! Hem bedenini hem ruhunu. Sağlıklı olmak bir öz-sevgi eylemidir!': t('motivation.messages.nourishYourselfFood'),
      'Kendine ilham ver! Senin hikayen, senin yolculuğun çok değerli. Kendini kutla!': t('motivation.messages.inspireYourself'),
      'Kendini kucakla! Bugün zor olsa bile, sen güçlüsün. Kendine sarıl, sen değerlisin!': t('motivation.messages.hugYourselfBlue'),
      'Bazen fark etmesen de her gün biraz daha güçleniyorsun. Kendine inan, sen muhteşemsin!': t('motivation.messages.strongerEveryDay'),
      'Şükretmek kalbi ferahlatır. İşte şu an sahip olduğun her şey bir nimet. Hayattan keyif al!': t('motivation.messages.gratitudePractice'),
      'Her duygun seni sen yapan şeylerden biri. Onları kabul et, onlarla barış. Çok güzelsin!': t('motivation.messages.emotionalAwareness'),
      'Her yeni gün, yeni bir sen olmak için bir fırsat. Sen sürekli dönüşüyorsun ve bu çok güzel!': t('motivation.messages.growthMindset'),
      'Her yeni gün yeni umutlar, yeni başlangıçlar demek. Hayallerine adım adım yaklaşıyorsun!': t('motivation.messages.futurePlanning'),
      'Kendini yorma, dinlenmeyi bil. Enerjini korumak seni daha mutlu yapar. Kendine iyi bak!': t('motivation.messages.energyAwareness'),
      'The beautiful connections you build with people enrich your life. Share with love!': t('motivation.messages.communicationSkills'),
      'Küçük de olsa her adımın önemli! Kendini kutlamayı unutma, sen harikasın!': t('motivation.messages.accomplishmentCelebration'),
      'Şu an burada olmak ne güzel değil mi? Her anın tadını çıkar, yaşamın güzelliğini hisset!': t('motivation.messages.mindfulLiving'),
      'Huzur dışarıda değil, içinde. Kendine zaman ayırarak içindeki huzuru büyütüyorsun. Ne güzel!': t('motivation.messages.peaceWithin'),
      'Sen bu dünyada bir tanesin. Kendini olduğun gibi kabul et ve sev. Çok değerlisin!': t('motivation.messages.selfLove'),
      'İçindeki güzellik her geçen gün daha çok parlıyor. Kendini olduğun gibi yaşa!': t('motivation.messages.beautifulSoul'),
      'Derin bir nefes al. Omuzlarını gevşet. Her şey yoluna girecek. Sen harikasın!': t('motivation.messages.breatheRelax'),
      'Bugün mutlu olman için sana bir neden: Sen varsın! Hayatın güzel sürprizlerle dolu!': t('motivation.messages.smileToday'),
    };
    return translations[message] || message;
  };
  const [motivation, setMotivation] = useState<MotivationData | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const hasShownThisSession = useRef(false);
  const appState = useRef(AppState.currentState);
  
  const slideAnim = React.useRef(new Animated.Value(screenWidth)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // AppState listener - sadece uygulama açıldığında göster
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // Uygulama arka plandan aktif hale geldi - yeni session başladı
        hasShownThisSession.current = false;
        // Yeni session'da mesaj göster
        if (autoShow) {
          setTimeout(() => {
            loadMotivation();
            hasShownThisSession.current = true;
          }, delay);
        }
      }
      appState.current = nextAppState;
    });

    // Sadece uygulama ilk açıldığında ve daha önce bu session'da gösterilmediyse
    if (autoShow && !hasShownThisSession.current && appState.current === 'active') {
      const timer = setTimeout(() => {
        loadMotivation();
        hasShownThisSession.current = true;
      }, delay);
      
      return () => {
        clearTimeout(timer);
        subscription.remove();
      };
    }

    return () => {
      subscription.remove();
    };
  }, [autoShow, delay]);

  const loadMotivation = async () => {
    try {
      setIsLoading(true);
      const motivationData = await motivationService.getPersonalizedMotivation(userId);
      
      if (motivationData) {
        setMotivation(motivationData);
        showCard();
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error loading motivation:', error);
      setIsLoading(false);
    }
  };

  const showCard = () => {
    setIsVisible(true);
    setIsLoading(false);
    
    // Play notification sound
    soundService.playNotification();
    
    // Haptic feedback
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.log('Haptic feedback error:', error);
    }

    // Slide in animation
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideCard = async () => {
    // Play tap sound
    await soundService.playTap();
    
    // Haptic feedback
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.log('Haptic feedback error:', error);
    }

    // Slide out animation
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: screenWidth,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsVisible(false);
      onDismiss?.();
    });
  };

  const getGradientColors = (priority: string) => {
    switch (priority) {
      case 'high':
        return [currentTheme.colors.primary, currentTheme.colors.secondary];
      case 'medium':
        return [currentTheme.colors.primary + 'CC', currentTheme.colors.secondary + 'CC'];
      case 'low':
        return [currentTheme.colors.primary + 'AA', currentTheme.colors.secondary + 'AA'];
      default:
        return [currentTheme.colors.primary, currentTheme.colors.secondary];
    }
  };

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: 60,
      left: 16,
      right: 16,
      zIndex: 1000,
    },
    card: {
      borderRadius: 20,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 16,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    emoji: {
      fontSize: 32,
      marginRight: 12,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: currentTheme.colors.background,
      flex: 1,
      fontFamily: 'Poppins_700Bold',
    },
    message: {
      fontSize: 14,
      color: currentTheme.colors.background + 'E6',
      lineHeight: 20,
      marginBottom: 16,
      fontFamily: 'Poppins_400Regular',
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    priorityIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    priorityText: {
      fontSize: 12,
      color: currentTheme.colors.background + 'B3',
      marginLeft: 4,
      fontFamily: 'Poppins_400Regular',
    },
    closeButton: {
      padding: 8,
      borderRadius: 16,
      backgroundColor: currentTheme.colors.background + '33',
    },
  });

  if (isLoading) {
    return null;
  }

  if (!isVisible || !motivation) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateX: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <LinearGradient
        colors={getGradientColors(motivation.priority) as [string, string, ...string[]]}
        style={styles.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <Text style={styles.emoji}>{motivation.emoji}</Text>
          <Text style={styles.title}>{getTranslatedTitle(motivation.title, motivation.id)}</Text>
        </View>
        
        <Text style={styles.message}>{getTranslatedMessage(motivation.message, motivation.id)}</Text>
        
        <View style={styles.footer}>
          <View style={styles.priorityIndicator}>
            <Ionicons 
              name={motivation.priority === 'high' ? 'star' : motivation.priority === 'medium' ? 'star-half' : 'star-outline'} 
              size={14} 
              color={currentTheme.colors.background + 'B3'} 
            />
            <Text style={styles.priorityText}>
              {motivation.priority === 'high' ? (t('welcome') === 'Welcome' ? 'Important' : 'Önemli') : 
               motivation.priority === 'medium' ? (t('welcome') === 'Welcome' ? 'Medium' : 'Orta') : 
               (t('welcome') === 'Welcome' ? 'Info' : 'Bilgi')}
            </Text>
          </View>
          
          <TouchableOpacity style={styles.closeButton} onPress={hideCard}>
            <Ionicons name="close" size={16} color={currentTheme.colors.background} />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}
