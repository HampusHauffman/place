package Hampus.place.redis;

import Hampus.place.Pixel;
import Hampus.place.webhook.Webhook;
import com.fasterxml.jackson.core.JsonParser;
import java.util.ArrayList;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
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

  @Autowired
  Webhook webhook;

  public void onMessage(Message message, byte[] pattern) {

    messageList.add(message.toString());
    Pixel p = (Pixel) serializer.deserialize(message.getBody());
    log.info("Message received from Redis sub: {}", p);
    webhook.sendPixel(p);
  }
}


