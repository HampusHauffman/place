package Hampus.place.redis;

import Hampus.place.Pixel;
import Hampus.place.webhook.Webhook;
import java.util.ArrayList;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class RedisMessageSubscriber implements MessageListener {

  public static List<String> messageList = new ArrayList<>();
  @Autowired
  Webhook webhook;
  @Autowired
  private RedisTemplate<String, Pixel> redisTemplate;

  public void onMessage(Message message, byte[] pattern) {

    messageList.add(message.toString());
    Pixel p = (Pixel) redisTemplate.getValueSerializer().deserialize(message.getBody());
    log.info("Message received from Redis sub: {}", p);
    webhook.sendPixel(p);
  }
}


