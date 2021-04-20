package Hampus.place.redis;

import Hampus.place.Pixel;
import com.fasterxml.jackson.core.JsonParser;
import java.util.ArrayList;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.configurationprocessor.json.JSONObject;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class RedisMessageSubscriber implements MessageListener {

  public static List<String> messageList = new ArrayList<>();

  private Jackson2JsonRedisSerializer serializer = new Jackson2JsonRedisSerializer(Pixel.class);


  public void onMessage(Message message, byte[] pattern) {

    messageList.add(message.toString());
    var p = serializer.deserialize(message.getBody());
    log.info("Message received: {}", p);
  }
}


