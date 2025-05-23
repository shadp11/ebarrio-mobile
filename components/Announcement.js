import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Image,
} from "react-native";
import { MyStyles } from "./stylesheet/MyStyles";
import { useContext, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import { useEffect } from "react";
import axios from "axios";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { InfoContext } from "../context/InfoContext";
import api from "../api";
import { Dropdown } from "react-native-element-dropdown";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import AppLogo from "../assets/applogo-lightbg.png";

//ICONS
import Ionicons from "@expo/vector-icons/Ionicons";

const Announcement = () => {
  const insets = useSafeAreaInsets();
  const { fetchAnnouncements, announcements } = useContext(InfoContext);
  const { user } = useContext(AuthContext);
  const navigation = useNavigation();
  const [sortOption, setSortOption] = useState("Newest");
  dayjs.extend(relativeTime);
  const [expandedAnnouncements, setExpandedAnnouncements] = useState([]);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleHeart = async (announcementID) => {
    try {
      await api.put(`/heartannouncement/${announcementID}`);
    } catch (error) {
      console.log("Error liking announcement", error);
    }
  };

  const handleUnheart = async (announcementID) => {
    try {
      await api.put(`/unheartannouncement/${announcementID}`);
    } catch (error) {
      console.log("Error liking announcement", error);
    }
  };

  /* EXPANDED ANNOUNCEMENTS */
  const toggleExpanded = (id) => {
    setExpandedAnnouncements((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const sortedAnnouncements = [...announcements].sort((a, b) => {
    if (sortOption === "newest") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }
  });

  const renderContent = (announcement) => {
    let eventInfo = "";
    if (announcement.eventStart) {
      const startDate = new Date(announcement.eventStart);
      const endDate = new Date(announcement.eventEnd);

      const formattedDate = startDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      const formattedStartTime = startDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      const formattedEndTime = endDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      eventInfo = `📅 ${formattedDate}\n🕒 ${formattedStartTime} - ${formattedEndTime}\n\n`;
    }

    const words = announcement.content.split(" ");
    const isLong = words.length > 25;
    const isExpanded = expandedAnnouncements.includes(announcement._id);
    const displayText = isExpanded
      ? announcement.content
      : words.slice(0, 25).join(" ") + (isLong ? "..." : "");

    return (
      <View style={{ marginVertical: 10 }}>
        {eventInfo !== "" && (
          <Text style={{ marginBottom: 5, fontSize: 16 }}>{eventInfo}</Text>
        )}
        <Text style={{ fontSize: 16, color: "#333", textAlign: "justify" }}>
          {displayText}
        </Text>
        {isLong && (
          <Text
            style={{ color: "#006EFF", marginTop: 5 }}
            onPress={() => toggleExpanded(announcement._id)}
          >
            {isExpanded ? "See less" : "See more"}
          </Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView
      style={{ flex: 1, paddingTop: insets.top, backgroundColor: "#F0F4F7" }} // para hindi nago-overlap sa status bar when scrolled
    >
      <ScrollView
        contentContainerStyle={[
          MyStyles.scrollContainer,
          {
            paddingBottom: insets.bottom + 70,
            gap: 10,
          },
        ]}
      >
        <Text style={[MyStyles.header, { marginBottom: 0 }]}>
          Announcements
        </Text>
        <Dropdown
          data={[
            { label: "Newest", value: "newest" },
            { label: "Latest", value: "latest" },
          ]}
          labelField="label"
          valueField="value"
          value={sortOption}
          placeholder={sortOption}
          onChange={(item) => setSortOption(item.value)}
          style={{
            backgroundColor: "#fff",
            width: "30%",
            height: 30,
            borderWidth: 1,
            borderColor: "#ACACAC",
            borderRadius: 5,
            alignSelf: "flex-end",
            padding: 4,
          }}
        />
        {announcements.map((element, index) => (
          <View
            key={index}
            style={{
              backgroundColor: "#fff",
              borderRadius: 15,
              width: "100%",
              padding: 10,
              // iOS shadow
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              // Android shadow
              elevation: 5,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                source={AppLogo}
                style={{ width: 60, height: 60, marginLeft: -8 }}
              />
              <View style={{ marginLeft: 5 }}>
                <Text style={{ color: "#04384E", fontSize: 16 }}>
                  {element.uploadedby}
                </Text>
                <Text style={{ fontSize: 14, color: "000" }}>
                  {dayjs(element.createdAt).fromNow()}
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: "row" }}>
              <Text style={{ color: "#04384E", fontSize: 16 }}>Category: </Text>
              <Text style={{ color: "#04384E", fontSize: 16 }}>
                {element.category}
              </Text>
            </View>
            <View style={{ flexDirection: "row" }}>
              <Text style={{ color: "#04384E", fontSize: 16 }}>Title: </Text>
              <Text style={{ color: "#04384E", fontSize: 16 }}>
                {element.title}
              </Text>
            </View>

            {element.picture && element.picture.trim() !== "" && (
              <Image
                source={{ uri: element.picture }}
                style={{
                  width: "100%",
                  height: 200,
                  borderRadius: 15,
                  marginTop: 10,
                }}
                resizeMode="cover"
              />
            )}

            {renderContent(element)}

            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 3 }}
            >
              {element.heartedby.includes(user.userID) ? (
                <TouchableOpacity onPress={() => handleUnheart(element._id)}>
                  <Ionicons name="heart" size={24} color="red" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => handleHeart(element._id)}>
                  <Ionicons name="heart-outline" size={24} color="black" />
                </TouchableOpacity>
              )}
              <Text>{element.hearts}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};
export default Announcement;
